// js/app.js
document.addEventListener('DOMContentLoaded', () => {

    const switchTo417Btn = document.getElementById('switch-to-417');
    const switchTo128Btn = document.getElementById('switch-to-128');
    const app417Container = document.getElementById('app-417-container');
    const app128Container = document.getElementById('app-128-container');

    function switchApp(appToShow) {
        if (appToShow === '417') {
            app417Container.classList.remove('hidden');
            app128Container.classList.add('hidden');
            switchTo417Btn.classList.add('active');
            switchTo128Btn.classList.remove('active');
        } else {
            app417Container.classList.add('hidden');
            app128Container.classList.remove('hidden');
            switchTo417Btn.classList.remove('active');
            switchTo128Btn.classList.add('active');
        }
    }

    switchTo417Btn.addEventListener('click', () => switchApp('417'));
    switchTo128Btn.addEventListener('click', () => switchApp('128'));
    
    async function exportCanvasesToDirectory(canvases, filenames) {
        if (canvases.length === 0) {
            alert("Không có ảnh nào để xuất.");
            return;
        }

        if (window.showDirectoryPicker) {
            try {
                const dirHandle = await window.showDirectoryPicker();
                let savedCount = 0;

                for (let i = 0; i < canvases.length; i++) {
                    const canvas = canvases[i];
                    const filename = filenames[i];
                    if (!canvas || !filename) continue;

                    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
                    const writable = await fileHandle.createWritable();
                    
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    
                    await writable.write(blob);
                    await writable.close();
                    savedCount++;
                }
                alert(`Đã xuất thành công ${savedCount} ảnh vào thư mục đã chọn!`);
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error("Lỗi khi xuất ảnh:", err);
                    alert("Đã xảy ra lỗi khi xuất ảnh: " + err.message);
                }
            }
        } else {
            alert("Trình duyệt của bạn không hỗ trợ chọn thư mục. Mỗi ảnh sẽ được tải xuống riêng lẻ.");
            let savedCount = 0;
            for (let i = 0; i < canvases.length; i++) {
                const canvas = canvases[i];
                const filename = filenames[i];
                if (!canvas || !filename) continue;
                
                const link = document.createElement('a');
                link.download = filename;
                link.href = canvas.toDataURL('image/png');
                link.click();
                savedCount++;
            }
             alert(`Đã bắt đầu tải xuống ${savedCount} ảnh.`);
        }
    }

    initializePdf417Generator(exportCanvasesToDirectory);
    initializeCode128Generator(exportCanvasesToDirectory);

    switchApp('417');
});
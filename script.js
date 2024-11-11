function getLuminance(R, G, B) {
    let lum = Math.floor(Math.sqrt( 0.299*R**2 + 0.587*G**2 + 0.114*B**2 ));
    return lum;
}

function returnLumArray(row){
    let returnRow = []
    for(let i=0;i<row.length;i=i+3){ //array will be like [[r1,g1,b1],... [r2,g2,b2]...]
        const r = row[i];
        const g = row[i+1];
        const b = row[i+2];
        const lumVal = getLuminance(r,g,b);
        returnRow.push(lumVal);
    }
    return returnRow;
}

function getIndexOfMaxLuminanceValue(row){
    let returnRow = []
    for(let i=0;i<row.length;i=i+3){ //array will be like [[r1,g1,b1],... [r2,g2,b2]...]
        const r = row[i][0];
        const g = row[i][1];
        const b = row[i][2];
        const lumVal = getLuminance(r,g,b);
        returnRow.push(lumVal);
    }
    const maxLum = Math.max(...returnRow);
    let maxLumIndex = 0;
    returnRow.forEach((val,index)=>{
        if(val === maxLum){
            maxLumIndex = index;
        }
    })
    return maxLumIndex;
}

function sortRowByLuminance(row) {
    return row.sort((a, b) => {
        const luminanceA = getLuminance(a[0], a[1], a[2]);
        const luminanceB = getLuminance(b[0], b[1], b[2]);
        return luminanceA - luminanceB;
    });
}

function findWhiteParts(row){
    let arr = [];
    toggle = false;
    for(let i=0;i<row.length;i++){
        if(row[i][0] === 255){ //if current pixel is white
            if(toggle === false){
                toggle = true;
                arr.push(i);
            }
            if(toggle === true && i===row.length-1){
                arr.push(i);
            }
        }
        if(row[i][0] === 0){ //if current pixel is black
            if(toggle === true){ //if previous pixel was white
                arr.push(i);
                toggle = false;
            }
        }
    }
    
    let pairArray = [];
    for(let i=0;i<arr.length;i=i+2){
        pairArray.push([arr[i],arr[i+1]]);
    }
    return pairArray;
}

function sortOnlyWhiteParts(row, pairArray){
    let returnRow = [...row];
    pairArray.forEach(pair => {
        const whiteSegment = returnRow.slice(pair[0], pair[1] + 1);
        const sortedSegment = sortRowByLuminance(whiteSegment);
        returnRow.splice(pair[0], pair[1] - pair[0] + 1, ...sortedSegment);
    });
    return returnRow;
}
document.getElementById('upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    if (file) {
        const img = new Image();
        img.onload = function () {
            // canvas.width = img.width;
            // canvas.height = img.height;
            // ctx.drawImage(img, 0, 0);
            const newWidth = 500;
            const aspectRatio = img.height / img.width;
            const newHeight = newWidth * aspectRatio;
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(img, 0, 0, newWidth, newHeight);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = newWidth;
            
            

            for (let y = 0; y < canvas.height; y++) { //going through rows
                let row = [];

                for (let x = 0; x < width; x++) { //going through columns of row to get rgb data
                    const index = (y * width + x)*4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2]; //array will be like [[r1,g1,b1], [r2,b2,g2]...]
                    row.push([r, g, b]);
                }
                
                let greyScaleRow = [];
                for (let i = 0; i < data.length; i++) {
                    const index = (y * width + i)*4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];
                    const grey = getLuminance(r, g, b);
                    greyScaleRow.push([grey,grey,grey]);
                }
                
                const thresholdVal = 40; //change threshold val for different results
                for (let i = 0; i < data.length; i++) {
                    const pixelVal = greyScaleRow[i][0];
                    if(pixelVal >= thresholdVal){
                        greyScaleRow[i][0] = greyScaleRow[i][1] = greyScaleRow[i][2] = 255;
                    }else{
                        greyScaleRow[i][0] = greyScaleRow[i][1] = greyScaleRow[i][2] = 0;
                    }
                }
                
                let contrastMask = findWhiteParts(greyScaleRow);
                let sortedRow = sortOnlyWhiteParts(row, contrastMask);
                
                for (let x = 0; x < width; x++) {
                    const index = (y * width + x) * 4;
                    data[index] = sortedRow[x][0];
                    data[index + 1] = sortedRow[x][1];
                    data[index + 2] = sortedRow[x][2]; 
                }
            }

            ctx.putImageData(imageData, 0, 0);
        };
        img.src = URL.createObjectURL(file);
    }
});
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
    console.log(maxLumIndex);
    return maxLumIndex;
}

function sortRowByLuminance(row) {
    return row.sort((a, b) => {
        const luminanceA = getLuminance(a[0], a[1], a[2]);
        const luminanceB = getLuminance(b[0], b[1], b[2]);
        return luminanceA - luminanceB;
    });
}

document.getElementById('upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    if (file) {
        const img = new Image();
        img.onload = function () {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const width = canvas.width;

            const greyImg =  img.grey();
            const greyData = greyImg.data;

            for (let i = 0; i < data.length; i += 4) {
                let contrastFactor = 1.2; // Increase or decrease this shit to control contrast strength
                greyData[i] = Math.min(255, Math.max(0, data[i] * contrastFactor));
                greyData[i + 1] = Math.min(255, Math.max(0, data[i + 1] * contrastFactor));
                greyData[i + 2] = Math.min(255, Math.max(0, data[i + 2] * contrastFactor));
            }

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        
                data[i] = data[i + 1] = data[i + 2] = gray;
            }

            for (let y = 0; y < canvas.height; y++) { //going through rows
                let maxLumIndex = 0;
                let row = [];

                for (let x = 0; x < width; x++) { //going through columns of row to get rgb data
                    const index = (y * width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2]; //array will be like [[r1,g1,b1], [r2,b2,g2]...]
                    row.push([r, g, b]);
                }
                
                maxLumIndex = getIndexOfMaxLuminanceValue(row);

                //let sortedRow = row.slice(0, maxLumIndex).concat(sortRowByLuminance(row.slice(maxLumIndex)));
                
                let sortedRow = sortRowByLuminance(row);
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
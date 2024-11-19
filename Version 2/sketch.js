let exampleShader;

function preload(){
  exampleShader = loadShader('example.vert', 'example.frag');
}

function setup() {
  createCanvas(400, 400, WEBGL);
  shader(exampleShader);
  noStroke(); //no shape outlines
}

function draw() {
  clear(); //clear between frames
  rect(0,0,height,width);
}

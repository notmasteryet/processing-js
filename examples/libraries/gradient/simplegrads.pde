Gradient grad1 = new Gradient(0,0,640,480,"#ff00ff","#00aaff");
Gradient grad2 = new Gradient(50,50,200,100,"#ff00aa","#ffffaa");

void setup(){
  frameRate(2);
  size(640,480);
  noStroke();
}


void draw(){
  grad1.background();

  grad2.fill();
  rect(50,50,200,100);
}

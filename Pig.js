class Pig extends BaseClass
 {
  constructor(x, y)
  {
    super(x,y,50,50);
    this.image = loadImage("sprites/enemy.png");
    this.remove=true;
 //this.Visiblity=255;
  }
  display()
  {
     //console.log(this.body.speed);
      if(this.body.speed < 3)
      { 
        super.display(); 
      } 
      else{
World.remove(world, this.body);
if(this.remove==true) 
      { 
        score=score+50;
        this.remove=false; 
     }
    } 
  }


};

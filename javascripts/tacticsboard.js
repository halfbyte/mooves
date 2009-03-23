
function Player(x,y, rot, image) {
  this.x = x
  this.y = y
  this.rot = rot
  this.image = image
  this.bound = false
  this.hover = false
  
}

function Arrow(x,y,xEnd, yEnd) {
  this.x = x
  this.xEnd = xEnd
  this.y = y
  this.yEnd = yEnd
  this.finished = false
  this.hoverStart = false
  this.hoverEnd = false
  this.boundStart = false
  this.boundEnd = false
}

var board = {
  players: [],
  arrows: [],
  images: {},
  tool: 'move',
  mouseY: 0,
  imageLoadCount: 0,
  imageCount: 2,
  context: null,
  init: function() {
    var self = this;
    this.images.player_a = new Image();
    this.images.player_a.src = "images/player_a.png"
    this.images.player_b = new Image();
    this.images.player_b.src = "images/player_b.png"
    var canvas = $('#board')[0]
    var ctx = canvas.getContext("2d");
    this.context = ctx;
    this.players[this.players.length] = new Player(200,200,Math.PI*(45/180), this.images.player_a);
    this.players[this.players.length] = new Player(100,100,Math.PI*(75/180), this.images.player_b);
    // players[players.length] = new Player(20,20,0.4);
    this.images.player_a.onload = function() {
      self.imageLoadCount++;
    }
    this.images.player_b.onload = function() {
      self.imageLoadCount++;
    }
    
    
    
    window.setTimeout('board.checkLoadStatus();', 50)
  },
  
  initEventHandlers: function() {
    var self = this;
    
    $(window).keydown(function(event){
      if (event.keyCode == 18) {
        self.tool = 'turn';
      }
        
      
    });
    
    $(window).keyup(function(event){
      if (event.keyCode == 18) {
        self.tool = 'move'
      }
      
    });
    
    
    $('#board').mouseup(function(e) {
      var anyPlayerBound = false
      jQuery.each(self.players, function(i, player) {
        if (player.bound) anyPlayerBound = true;
        player.bound = false
      })
      if (!anyPlayerBound) {
        jQuery.each(self.arrows, function(i,arrow) {
          if (!arrow.finished) {
            arrow.finished = true
          }
          if (arrow.boundStart) {
            arrow.boundStart = false
          }
          if (arrow.boundEnd) {
            arrow.boundEnd = false
          }
        })        
      }
      self.draw();
    })

    $('#board').mousemove(function(e) {
      var x = (e.pageX - $('#board').offset().left)
      var y = (e.pageY - $('#board').offset().top)
      var anyPlayerBound = false;
      jQuery.each(self.players, function(i, player) {
        if (player.bound) {
          anyPlayerBound = true
          if (self.tool == 'move') {
            player.x = x
            player.y = y            
          } else if(self.tool == 'turn') {
            var diff = self.mouseY - y
            player.rot -= diff / 20.0
            self.mouseY = y
          }
        } else {
          if (self.isInBounds(x,y,player.x,player.y,7)) {
            player.hover = true
          } else {
            player.hover = false
          }
        }
      })
      if (!anyPlayerBound) {
        var anyArrowUnfinished = false
        
        jQuery.each(self.arrows, function(i,arrow) {
          if (!arrow.finished) {
            anyArrowUnfinished = true
            arrow.xEnd = x;
            arrow.yEnd = y;
          }
        })
        if (!anyArrowUnfinished) {
          jQuery.each(self.arrows, function(i,arrow) {
            if (arrow.boundStart) {
              arrow.x = x
              arrow.y = y 
            } else if (arrow.boundEnd) {
              arrow.xEnd = x
              arrow.yEnd = y               
            } else {
              if (self.isInBounds(x,y,arrow.x,arrow.y,5)) {
                arrow.hoverStart = true
              } else {
                arrow.hoverStart = false
              }
              if (self.isInBounds(x,y,arrow.xEnd,arrow.yEnd,5)) {
                arrow.hoverEnd = true
              } else {
                arrow.hoverEnd = false
              }
            }
          })
        }
      }
      self.draw();
    })

    $('#board').mousedown(function(e) {
      var x = (e.pageX - $('#board').offset().left)
      var y = (e.pageY - $('#board').offset().top)
      self.mouseY = y
      
      var matchedPlayer = false;
      
      jQuery.each(self.players, function(i, player) {
        if (self.isInBounds(x,y,player.x,player.y,7)) {
          player.bound = true
          matchedPlayer = true
        }
      })        
      if (!matchedPlayer) {
        var anyArrowBound = false
        jQuery.each(self.arrows, function(i,arrow) {
          if (!arrow.finished) {
            arrow.finished = true
          }
          if (!anyArrowBound) {
            if (arrow.hoverStart) {
              arrow.boundStart = true
              anyArrowBound = true
            }
            if (arrow.hoverEnd) {
              arrow.boundEnd = true
              anyArrowBound = true
            }            
          }
        })
        if (!anyArrowBound) {
          var arrow = new Arrow(x,y,x,y);
          self.arrows[self.arrows.length] = arrow          
        }
      }
      self.draw();
    })
    
  },
  
  checkLoadStatus: function() {
    var self = this;
    var status = self.imageLoadCount / self.imageCount
    if (status >= 1) {
      self.draw();
      self.initEventHandlers();
    } else {
      window.setTimeout("board.checkLoadStatus();", 50)
    }
    
  },
  
  draw: function() {
    //var canvas = $('#board')[0]
    var ctx = this.context
    var self = this
    //ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0,0,600,400); // clear canvas
    jQuery.each(self.arrows, function(i,arrow) {
      ctx.save();
        ctx.lineWidth = 4
        if (arrow.finished) {
          ctx.strokeStyle = '#ffffff'
          ctx.fillStyle = "#ffffff"
        } else {
          ctx.strokeStyle = '#ffff00'
          ctx.fillStyle = "#ffff00"
        }
        ctx.beginPath();
        ctx.moveTo(arrow.x,arrow.y);
        ctx.lineTo(arrow.xEnd,arrow.yEnd);
        ctx.stroke();

        ctx.save();
          ctx.lineWidth = 2;
          var angle;
          ctx.translate(arrow.xEnd,arrow.yEnd);
          if ((arrow.xEnd == arrow.x)) {
            angle = (arrow.yEnd - arrow.y > 0) ? (Math.PI) : 0
          } else if ((arrow.xEnd - arrow.x) >= 0) {
            angle = Math.atan((arrow.yEnd - arrow.y) / (arrow.xEnd - arrow.x)) + (Math.PI / 2)
          } else {
            angle = Math.atan((arrow.yEnd - arrow.y) / (arrow.xEnd - arrow.x)) - (Math.PI / 2)
          }
          if (isNaN(angle)) {
                                angle = 0;
                              }
          ctx.rotate(angle);
          ctx.translate(-10,-5);
          ctx.beginPath();
          ctx.moveTo(10,0)
          ctx.bezierCurveTo(10,5,18,20,20,20);
          //ctx.lineTo(20,20)
          ctx.lineTo(0,20);
          //ctx.lineTo(10,0);
          ctx.bezierCurveTo(2,20,10,5,10,0);
          //ctx.closePath();
          ctx.fill();
        ctx.restore();
      
        if (arrow.hoverStart) {
          ctx.fillStyle = arrow.boundStart ? "#ffff00" : "#ff0000"
          ctx.fillRect(arrow.x-5, arrow.y-5, 10, 10)
        }
        if (arrow.hoverEnd) {
          ctx.fillStyle = arrow.boundEnd ? "#ffff00" : "#ff0000"
          ctx.fillRect(arrow.xEnd-5, arrow.yEnd-5, 10, 10)
        }
      ctx.restore();
    })

    jQuery.each(self.players, function(i, player) {
      ctx.save();
        ctx.translate(player.x,player.y)

        ctx.rotate(player.rot);

        ctx.lineWidth = 2
        ctx.drawImage(player.image, -20,-10);
        ctx.rotate(-player.rot);
        if (player.bound) {
          ctx.strokeStyle = "#ffff00"
          ctx.strokeRect(-7,-7,14,14) 
      
        } else if (player.hover) {
          ctx.strokeStyle = "#ff0000"
          ctx.strokeRect(-7,-7,14,14) 
        }
      ctx.restore();
    })
  },
  isInBounds: function(xEvent, yEvent, xTest, yTest, bounds) {
    return (xEvent > (xTest - bounds) && xEvent < (xTest + bounds) && yEvent > (yTest - bounds) && yEvent < (yTest) + bounds)
  }
}

$(document).ready(function() {
   board.init();
});

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
}

var board = {
  players: [],
  arrows: [],
  images: {},
  tool: 'move',
  mouseY: 0,
  imageLoadCount: 0,
  imageCount: 2,
  init: function() {
    var self = this;
    this.images.player_a = new Image();
    this.images.player_a.src = "images/player_a.png"
    this.images.player_b = new Image();
    this.images.player_b.src = "images/player_b.png"
    var canvas = $('#board')[0]
    var ctx = canvas.getContext("2d");

    this.players[this.players.length] = new Player(10,10,Math.PI*(45/180), this.images.player_a);
    this.players[this.players.length] = new Player(100,100,Math.PI*(75/180), this.images.player_b);
    // players[players.length] = new Player(20,20,0.4);
    this.images.player_a.onload = function() {
      self.imageLoadCount++;
    }
    this.images.player_b.onload = function() {
      self.imageLoadCount++;
    }
    
    
    $('ul#toolbar li #tool-move').click(function(e) {
      self.tool = 'move'
      self.setToolbar('move');
      return(false);
    })
    $('#tool-turn').click(function(e) {      
      self.tool = 'turn'
      self.setToolbar('turn');
      return(false);
    })
    $('#tool-arrow').click(function(e) {      
      self.tool = 'arrow'
      self.setToolbar('arrow');
      return(false);
    })
    self.setToolbar('move');
    window.setTimeout('board.checkLoadStatus();', 50)
  },
  
  initEventHandlers: function() {
    var self = this;
    $('#board').mouseup(function(e) {
      jQuery.each(self.players, function(i, player) {
        player.bound = false
      })
      if (self.tool == 'arrow') {
        jQuery.each(self.arrows, function(i,arrow) {
          if (!arrow.finished) {
            arrow.finished = true
          }
        })        
      }
      self.draw();
    })

    $('#board').mousemove(function(e) {
      var x = (e.pageX - $('#board').offset().left)
      var y = (e.pageY - $('#board').offset().top)
      jQuery.each(self.players, function(i, player) {
        if (player.bound) {
          if (self.tool == 'move') {
            player.x = x
            player.y = y            
          } else if(self.tool == 'turn') {
            var diff = self.mouseY - y
            console.log(diff)
            player.rot -= diff / 20.0
            self.mouseY = y
          }
        } else {
          if (x > (player.x - 7) && x < (player.x + 7) && y > (player.y - 7) && y < (player.y) + 7) {
            player.hover = true
          } else {
            player.hover = false
          }
        }
      })
      if (self.tool == 'arrow') {
        jQuery.each(self.arrows, function(i,arrow) {
          if (!arrow.finished) {
            arrow.xEnd = x;
            arrow.yEnd = y;
          }
        })
      }
      self.draw();
    })

    $('#board').mousedown(function(e) {
      var x = (e.pageX - $('#board').offset().left)
      var y = (e.pageY - $('#board').offset().top)
      self.mouseY = y
      if (self.tool == 'move' || self.tool == 'turn') {
        jQuery.each(self.players, function(i, player) {
          if (x > (player.x - 7) && x < (player.x + 7) && y > (player.y - 7) && y < (player.y) + 7) {
            player.bound = true        
          }
        })        
      } else if (self.tool == 'arrow') {
        jQuery.each(self.arrows, function(i,arrow) {
          if (!arrow.finished) {
            arrow.finished = true
          }
        })
        var arrow = new Arrow(x,y,x,y);
        console.log(arrow)
        self.arrows[self.arrows.length] = arrow
      }
      self.draw();
    })
    
  },
  
  checkLoadStatus: function() {
    var self = this;
    var status = self.imageLoadCount / self.imageCount
    console.log("status:" + status)
    if (status >= 1) {
      self.draw();
      self.initEventHandlers();
    } else {
      window.setTimeout("board.checkLoadStatus();", 50)
    }
    
  },
  
  setToolbar: function (tool) {
    $('ul#toolbar li a').removeClass('active')
    console.log('a#tool-' + tool)
    $('a#tool-' + tool).addClass('active')
  },
  draw: function() {
    var canvas = $('#board')[0]
    var ctx = canvas.getContext("2d");
    var self = this
    //ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0,0,600,400); // clear canvas
    jQuery.each(self.arrows, function(i,arrow) {
      ctx.save();
      ctx.lineWidth = 4
      if (arrow.finished) {
        ctx.strokeStyle = '#ffffff'
      } else {
        ctx.strokeStyle = '#ffff00'
      }
      ctx.beginPath();
      ctx.moveTo(arrow.x,arrow.y);
      ctx.lineTo(arrow.xEnd,arrow.yEnd);
      ctx.stroke();
        
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
  }
}

$(document).ready(function() {
   board.init();
});
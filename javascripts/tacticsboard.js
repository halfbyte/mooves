
function Player(x,y, rot) {
  this.x = x
  this.y = y
  this.rot = rot
  this.bound = false
  this.hover = false
  return this
}

var board = {
  players: [],
  images: {},
  tool: 'move',
  mouseY: 0,
  init: function() {
    var self = this;
    this.images.player = new Image();
    this.images.player.src = "images/player_a.png"
    var canvas = $('#board')[0]
    var ctx = canvas.getContext("2d");

    this.players[this.players.length] = new Player(10,10,Math.PI*(45/180));
    this.players[this.players.length] = new Player(100,100,Math.PI*(75/180));
    // players[players.length] = new Player(20,20,0.4);
    this.images.player.onload = function() {
      self.draw();
    }
    $('#board').mouseup(function(e) {
      jQuery.each(self.players, function(i, player) {
        player.bound = false
      })
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
            player.rot += diff / 20.0
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
      self.draw();
    })

    $('#board').mousedown(function(e) {
      var x = (e.pageX - $('#board').offset().left)
      var y = (e.pageY - $('#board').offset().top)
      self.mouseY = y

      jQuery.each(self.players, function(i, player) {
        if (x > (player.x - 7) && x < (player.x + 7) && y > (player.y - 7) && y < (player.y) + 7) {
          player.bound = true        
        }
      })
      self.draw();
    })
    
    $('#tool-move').click(function(e) {
      self.tool = 'move'
      return(false);
    })
    $('#tool-turn').click(function(e) {      
      self.tool = 'turn'
      return(false);
    })
    
      
  },
  draw: function() {
    var canvas = $('#board')[0]
    var ctx = canvas.getContext("2d");
    var self = this
    //ctx.globalCompositeOperation = 'destination-over';
    ctx.clearRect(0,0,600,400); // clear canvas

    jQuery.each(self.players, function(i, player) {
      ctx.save();
      ctx.translate(player.x,player.y)

      ctx.rotate(player.rot);
      if (player.bound) {
        ctx.strokeStyle = "#ffff00"
      } else {
        if (player.hover) {
          ctx.strokeStyle = "#ff00ff"
        } else {
          ctx.strokeStyle = "#ff0000"
        }

      }

      ctx.lineWidth = 2
      ctx.drawImage(self.images.player, -20,-10);
      ctx.rotate(-player.rot);
      ctx.strokeRect(-7,-7,14,14) 
      ctx.restore();
    })    
  }
}

$(document).ready(function() {
   board.init();
});
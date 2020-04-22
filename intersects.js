
function lineIntersectsRect(lStart, lEnd, rect) {
	let minX = lStart.x;
    let maxX = lEnd.x;
    if(lEnd.x < lStart.x) {
			maxX = lStart.x;
			minX = lEnd.x;
	}
	maxX = Math.min(maxX, rect.x + rect.width);
	minX = Math.max(minX, rect.x);
	if(minX > maxX) {return false;}
	let minY = lStart.y;
	let maxY = lEnd.y;
	let dx = lEnd.x - lStart.x;
	if(dx) { // there is a horizontal slope
		let a = (lEnd.y - lStart.y)/dx;
		let b = lStart.y - a * lStart.x;
		minY = a * minX + b;
		maxY = a * maxX + b;
	}
	if(minY > maxY) {
		[minY, maxY] = [maxY, minY]; // ES6 Destructuring Assignment swaps values
    }
    if(Math.max(minY, rect.y) > Math.min(maxY, rect.y + rect.height)){
        return false;
    }
	return true;
}
function lineIntersectsCircle(lStart, lEnd, center, radius) {
    let dist;
    const dx1 = lEnd.x - lStart.x;
    const dy1 = lEnd.y - lStart.y;
    const dx2 = center.x - lStart.x;
    const dy2 = center.y - lStart.y;
    // get the unit distance along the line of the closest point to circle center
    const u = (dx2 * dx1 + dy2 * dy1) / (dy1 * dy1 + dx1 * dx1);
    // if the point is on the line segment get the distance squared to circle center
    if(u >= 0 && u <= 1){
        dist = Math.pow((lStart.x + dx1 * u - center.x), 2) + Math.pow((lStart.y + dy1 * u - center.y), 2);
    } else {
         // use the u distance to determine which end is closest and get dist squared to circle
        dist = u < 0 ?
            Math.pow((lStart.x - center.x), 2) + Math.pow((lStart.y - center.y), 2) :
            Math.pow((lEnd.x - center.x), 2) + Math.pow((lEnd.y - center.y), 2);
    }
    return dist < Math.pow(radius, 2);
}
function lineIntersectsLine(p0, p1, p2, p3) {
    let dx1 = p1.x - p0.x;
    let dy1 = p1.y - p0.y;
    let dx2 = p3.x - p2.x;
    let dy2 = p3.y - p2.y;
    let d = dx1 * dy2 - dx2 * dy1;
    if(!d) { return false;}

    let dIsPositive = d > 0;

    let xd1 = p0.x - p2.x;
    let yd1 = p0.y - p2.y;
    let s_numer = dx1 * yd1 - dy1 * xd1;
    if((s_numer < 0) === dIsPositive) {
        return false; // watch logic = both true or both false returns false
    }

    let t_numer = dx2 * yd1 - dy2 * xd1;
    if((t_numer < 0) === dIsPositive) {
        return false;
    }

    if((s_numer > d) === dIsPositive || 
        (t_numer > d) === dIsPositive) {
        return false;
    }
    return true;
}
var Point = function(x,y){
    this.x = x;
    this.y = y;
};
var Line = function(start, end){ // constructor takes 2 Points
    this.start = start;
    this.end = end;
    this.started = false;
    this.lineDash = []; // solid line
    this.render = function(ctx, colour){
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
        ctx.strokeStyle = colour;
        ctx.setLineDash(this.lineDash);
        ctx.stroke();
        ctx.closePath();
    };
};
var view = {
    width: 800,
    height: 500,
    canvas: null,
    ctx: null,
    rect: null,
    line: new Line(new Point(0,0), new Point(0,0)), // the one the user draws
    testLines: [],
    init: function() {
        this.canvas = document.getElementById("cvView");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.testLines.push(new Line(new Point(62, 272), new Point(214,450)));
        this.testLines.push(new Line(new Point(225,370), new Point(352,370)));
        this.testLines.push(new Line(new Point(391,454), new Point(496,391)));
        this.testLines.push(new Line(new Point(555,325), new Point(555,441)));
    },
    render: function() {
        this.ctx.clearRect(0,0,this.width,this.height);
        circle.intersected = lineIntersectsCircle(this.line.start, this.line.end, circle.pos, circle.radius);
        rect.intersected = lineIntersectsRect(this.line.start, this.line.end, rect);
        circle.render(this.ctx);
        rect.render(this.ctx);
        for(let i = 0; i < this.testLines.length; i++){
            let l = this.testLines[i];
            let ints = lineIntersectsLine(l.start, l.end, this.line.start, this.line.end);
            l.render(this.ctx, ints ? "red" : "blue");
        }
        this.line.render(this.ctx, "black");
    }
};

var circle = {
    pos: {x: 100, y: 140},
    radius: 50,
    intersected: false,
    render: function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = (this.intersected) ? "red" : "blue";
        ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
};
var rect = {
    x: 600,
    y: 250,
    width: 80,
    height: 50,
    intersected: false,
    render: function(ctx) {
        ctx.beginPath();
        ctx.fillStyle = (this.intersected) ? "red" : "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.closePath();
    }
};
function initialise() {
    view.init();
    view.rect = view.canvas.getBoundingClientRect();
    view.render();
    window.addEventListener("mousedown", e =>{
        view.line.start = new Point(e.clientX - view.rect.left, e.clientY - view.rect.top);
        view.line.started = true;
    });
    window.addEventListener("mousemove", e =>{
        if(view.line.started){
            view.line.end = new Point(e.clientX - view.rect.left, e.clientY - view.rect.top);
            view.line.lineDash = [5,5]; // dashed line
            view.render();
        }
    });
    window.addEventListener("mouseup", e =>{
        view.line.end = new Point(e.clientX - view.rect.left, e.clientY - view.rect.top);
        view.line.lineDash = []; // solid line
        view.line.started = false;
        view.render();
    });
}
initialise();
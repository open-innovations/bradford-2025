/*!
 * WordCloud v1.1
 * by Stuart Lowe
 * Updated: 2026-03-04
 * 
 * Adapted and simplified from jQCloud v1.0.4
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license
 * Date: 2013-05-09
*/
(function(root){

	function ready(fn){
		// Version 1.1
		if(document.readyState != 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	}

	function WordCloud(el){

		let options = {};
		let cloud_namespace = el.getAttribute('id') || Math.floor((Math.random()*1000000)).toString(36);

		// Get words from the table
		let word_array = [];
		let input = el.querySelector('table.input');
		input.style.display = "none";
		let tr = input.querySelectorAll('tbody tr');
		for(let r = 0; r < tr.length; r++){
			let td = tr[r].querySelectorAll('td');
			if(td[0].innerText && td.length == 2){
				word_array.push({'word':td[0].innerText,'number':parseInt(td[1].innerText),'color':td[0].style.color});
			}
		}

		// Default options value
		let default_options = {
			width: el.offsetWidth,
			height: el.offsetHeight,
			shape: false, // It defaults to elliptic shape
			removeOverflowing: false,
			maxSize: 72,
			minSize: 12,
			padding: 16,
			wordpadding: 4,
			nWords: parseInt(el.getAttribute('data-maxWords'))||12
		};
		
		options = {...default_options, ...(options||{})};
		options.center = {x: options.width/2,y:options.height/2};

		el.classList.add('wordCloud');
		el.style['font-weight'] = "bold";
		let svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
		svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
		svg.setAttribute('preserveAspectRatio','xMidYMin meet');
		el.appendChild(svg);
		let words = [], already_placed_words = [], step, aspect_ratio;

		// Sort word_array from the word with the highest weight to the one with the lowest
		word_array.sort(function(a, b) { if (a.number < b.number) {return 1;} else if (a.number > b.number) {return -1;} else {return 0;} });

		// Only keep top words
		word_array = word_array.slice(0,options.nWords);
		
		this.init = function(){
			options.width = el.offsetWidth;
			options.height = el.offsetHeight;
			options.center = {x:options.width/2,y:options.height/2};
			svg.setAttribute('viewBox','0 0 '+options.width+' '+options.height);
			for(let i = 0; i < word_array.length; i++){
				let word = clone(word_array[i]);
				// Check if min(weight) > max(weight) otherwise use default
				if(word_array[0].number > word_array[word_array.length - 1].number){
					// Linearly map the original weight to a discrete scale from minSize to maxSize
					word.weight = Math.round((word.number - word_array[word_array.length - 1].number) / (word_array[0].number - word_array[word_array.length - 1].number) * (options.maxSize-options.minSize)) + options.minSize;
				}else{
					word.weight = options.minSize;
				}
				word.id = cloud_namespace + "_word_" + i;
				word.selector = "#" + word.id;
				word.span = document.createElementNS('http://www.w3.org/2000/svg','text');
				word.span.setAttribute('id',word.id);
				word.span.setAttribute('dominant-baseline','middle');
				word.span.setAttribute('alignment-baseline','baseline');
				word.span.setAttribute('text-anchor','middle');
				word.span.innerHTML = word.word;
				word.span.setAttribute('title',word.word+': '+word.number);
				word.span.setAttribute('x',options.center.x);
				word.span.setAttribute('y',options.center.y);
				if(word.color) word.span.setAttribute('fill',word.color);
				svg.append(word.span);
				words.push(word);
				if(OI && OI.Tooltips) OI.Tooltips.add(word.span,{});
			}
			let scale = 1;
			this.sizeWords(scale);
			while(words[0].span.__bbox.width > options.width*0.55){
				scale*= 0.9;
				this.sizeWords(scale);
			}
			this.draw();
			return this;
		};

		this.draw = function(){
			step = (options.shape === "rectangular") ? 18.0 : 2.0;
			already_placed_words = [];
			aspect_ratio = options.width / options.height;
			for(let i = 0; i < words.length; i++) this.drawWord(i,words[i]);
			return this;
		};

		this.sizeWords = function(scale){
			for(let i = 0; i < words.length; i++){
				words[i].span.setAttribute('font-size',(words[i].weight*scale)+'px');
				this.addBBoxMetrics(words[i].span);
			}
			return this;
		};

		// Function to draw a word, by moving it in spiral until it finds a suitable empty place. This will be iterated on each word.
		this.drawWord = function(index){
			let word = words[index];
			// Define the ID attribute of the <text> that will wrap the word, and the associated selector string
			let angle = 6.28 * Math.random(),
				radius = 0.0,
				// Only used if option.shape == 'rectangular'
				steps_in_direction = 0.0,
				quarter_turns = 0.0;

			let x = options.center.x + (index==0 ? word.span.__bbox.width*0.2 : 0);
			let y = options.center.y;
			this.updateBBox(word.span,x,y);
			
			let width = word.span.__bbox.width;
			let height = word.span.__bbox.height;

			while(hitTest(word.span, already_placed_words, options.wordpadding) || word.span.__bbox.left < options.padding || word.span.__bbox.right > options.width-options.padding || word.span.__bbox.top < options.padding || word.span.__bbox.bottom > options.height-options.padding){
				// option shape is 'rectangular' so move the word in a rectangular spiral
				if(options.shape === "rectangular"){
					steps_in_direction++;
					if(steps_in_direction * step > (1 + Math.floor(quarter_turns / 2.0)) * step * ((quarter_turns % 4 % 2) === 0 ? 1 : aspect_ratio)){
						steps_in_direction = 0.0;
						quarter_turns++;
					}
					switch(quarter_turns % 4) {
						case 1:
							x += step * aspect_ratio + Math.random() * 2.0;
							break;
						case 2:
							y -= step + Math.random() * 2.0;
							break;
						case 3:
							x -= step * aspect_ratio + Math.random() * 2.0;
							break;
						case 0:
							y += step + Math.random() * 2.0;
							break;
					}
				}else{ // Default settings: elliptic spiral shape
					radius += step;
					angle += (index % 2 === 0 ? 1 : -1)*step;
					x = options.center.x - (width / 2.0) + (radius*Math.cos(angle)) * aspect_ratio;
					y = options.center.y + radius*Math.sin(angle) - (height / 2.0);
				}
				// Update the bounding box
				this.updateBBox(word.span,x,y);
			}

			already_placed_words.push(word.span);

			return this;

		};

		this.addBBoxMetrics = function(span){
			const txt = span.innerHTML;
			const l = txt.length;
			const canvas = document.createElement("canvas");
			canvas.width = el.offsetWidth;
			canvas.height = el.offsetHeight;
			const ctx = canvas.getContext("2d");
			const sty = window.getComputedStyle(span);
			ctx.font = sty['font-weight']+" "+span.getAttribute('font-size')+" "+sty['font-family'];
			const x = parseFloat(span.getAttribute('x'));
			const y = parseFloat(span.getAttribute('y'));
			const metric = ctx.measureText(txt);
			const h = metric.actualBoundingBoxAscent + metric.actualBoundingBoxDescent;
			let bbox = {
				'left':x - metric.width/2,
				'right':x + metric.width/2,
				'top':y - h/2,
				'bottom':y + h/2,
				'width':metric.width,
				'height':h
			};
			span.__bbox = bbox;
			return bbox;
		};

		this.updateBBox = function(span,x,y){
			const xo = parseFloat(span.getAttribute('x'));
			const yo = parseFloat(span.getAttribute('y'));
			span.setAttribute('x',x);
			span.setAttribute('y',y);
			let dx = x-xo;
			let dy = y-yo;
			span.__bbox.left += dx;
			span.__bbox.right += dx;
			span.__bbox.top += dy;
			span.__bbox.bottom += dy;
			return span.__bbox;
		}

		// Delay execution so that the browser can render the page before the computatively intensive word cloud drawing
		let _obj = this;
		setTimeout(function(){ _obj.init(); }, 10);

		return this;
	}

	function clone(a){
		return JSON.parse(JSON.stringify(a));
	}
	function overlapping(a, b, padding){
		let RectA = clone(a.__bbox);
		let RectB = clone(b.__bbox);
		if(padding > 0){
			RectA.left -= padding;
			RectA.right += padding;
			RectA.top -= padding;
			RectA.bottom += padding;
		}
		return (RectA.left < RectB.right && RectA.right > RectB.left && RectA.top < RectB.bottom && RectA.bottom > RectB.top);
	}
	
	// Helper function to test if an element overlaps others
	function hitTest(elem, other_elems, padding){
		// Pairwise overlap detection
		var i = 0;
		// Check elements for overlap one by one, stop and return false as soon as an overlap is found
		for(i = 0; i < other_elems.length; i++){
			if(overlapping(elem, other_elems[i],padding)) return true;
		}
		return false;
	}

	ready(function(){
		document.querySelectorAll('[data-comp=wordCloud]').forEach(el => new WordCloud(el));
	});
	
})(window || this);

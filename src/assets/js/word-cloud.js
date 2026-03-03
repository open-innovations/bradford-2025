/*!
 * WordCloud adapted from jQCloud v1.0.4 
 *  Date: 2026-03-03
 *
 * jQCloud copyright 2011, Luca Ongaro
 *  Licensed under the MIT license.
 *  Date: 2013-05-09
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
		let input = el.querySelector('table.input');
		input.style.display = "none";
		let tr = input.querySelectorAll('tbody tr');

		let word_array = [];
		for(let r = 0; r < tr.length; r++){
			let td = tr[r].querySelectorAll('td');
			if(td[0].innerText && td.length == 2){
				word_array.push({'word':td[0].innerText,'weight':parseInt(td[1].innerText),'color':td[0].style.color});
			}
		}
		console.log(input,tr,word_array);

		// Default options value
		let default_options = {
			width: el.offsetWidth,
			height: el.offsetHeight,
			center: {
				x: ((options && options.width) ? options.width : el.offsetWidth) / 2.0,
				y: ((options && options.height) ? options.height : el.offsetHeight) / 2.0
			},
			shape: false, // It defaults to elliptic shape
			encodeURI: true,
			removeOverflowing: true,
			maxSize: 5,
			minSize: 0.8,
			nWords: parseInt(el.getAttribute('data-maxWords'))||12
		};
		
		options = {...default_options, ...(options||{})};

		el.classList.add('wordCloud');
		el.style.width = options.width;
		el.style.height = options.height;
		el.style.position = "relative";
		el.style['font-weight'] = "bold";
		let already_placed_words = [], step, aspect_ratio;

		this.draw = function(){
			console.log('draw',word_array);
			// Make sure every weight is a number before sorting
			for(let i = 0; i < word_array.length; i++){
				word_array[i].weight = parseFloat(word_array[i].weight, 10);
			}
			
			// Sort word_array from the word with the highest weight to the one with the lowest
			word_array.sort(function(a, b) { if (a.weight < b.weight) {return 1;} else if (a.weight > b.weight) {return -1;} else {return 0;} });

			// Only keep top words
			word_array = word_array.slice(0,options.nWords);

			console.log('draw',word_array);

			step = (options.shape === "rectangular") ? 18.0 : 2.0;
			already_placed_words = [];
			aspect_ratio = options.width / options.height;

			// Iterate drawOneWord on every word. The way the iteration is done depends on the drawing mode
			if(word_array.length > 50) this.drawOneWordDelayed();
			else{
				for(let i = 0; i < word_array.length; i++) this.drawOneWord(i,word_array[i]);
			}

		};

		// Delay execution so that the browser can render the page before the computatively intensive word cloud drawing
		let _obj = this;
		setTimeout(function(){ _obj.draw(); }, 10);

		this.drawOneWordDelayed = function(){
			console.log('drawOneWordDelayed');
		};

		// Function to draw a word, by moving it in spiral until it finds a suitable empty place. This will be iterated on each word.
		this.drawOneWord = function(index, word){
			console.log('drawOneWord',word_array);
			// Define the ID attribute of the span that will wrap the word, and the associated jQuery selector string
			let word_id = cloud_namespace + "_word_" + index,
				word_selector = "#" + word_id,
				angle = 6.28 * Math.random(),
				radius = 0.0,
				// Only used if option.shape == 'rectangular'
				steps_in_direction = 0.0,
				quarter_turns = 0.0,
				weight = 5,
				custom_class = "",
				inner_html = "",
				word_span;

			// Check if min(weight) > max(weight) otherwise use default
			if (word_array[0].weight > word_array[word_array.length - 1].weight) {
				// Linearly map the original weight to a discrete scale from 1 to 10
				weight = Math.round((word.weight - word_array[word_array.length - 1].weight) / (word_array[0].weight - word_array[word_array.length - 1].weight) * 9.0) + 1;
			}
			word_span = document.createElement('span');
			word_span.setAttribute('id',word_id);
			word_span.style['font-size'] = Math.max(options.minSize,(weight*options.maxSize/10))+'em';
			word_span.style['line-height'] = "100%";
			if(word.color) word_span.style.color = word.color;
			word_span.innerHTML = word.word;

			el.append(word_span);
			let width = word_span.offsetWidth,
				height = word_span.offsetHeight,
				left = options.center.x - width / 2.0,
				top = options.center.y - height / 2.0;

			// Save a reference to the style property, for better performance
			let word_style = word_span.style;
			word_style.position = "absolute";
			word_style.left = left + "px";
			word_style.top = top + "px";


			while(hitTest(word_span, already_placed_words)){
				// option shape is 'rectangular' so move the word in a rectangular spiral
				if(options.shape === "rectangular"){
					steps_in_direction++;
					if(steps_in_direction * step > (1 + Math.floor(quarter_turns / 2.0)) * step * ((quarter_turns % 4 % 2) === 0 ? 1 : aspect_ratio)){
						steps_in_direction = 0.0;
						quarter_turns++;
					}
					switch(quarter_turns % 4) {
						case 1:
							left += step * aspect_ratio + Math.random() * 2.0;
							break;
						case 2:
							top -= step + Math.random() * 2.0;
							break;
						case 3:
							left -= step * aspect_ratio + Math.random() * 2.0;
							break;
						case 0:
							top += step + Math.random() * 2.0;
							break;
					}
				}else{ // Default settings: elliptic spiral shape
					radius += step;
					angle += (index % 2 === 0 ? 1 : -1)*step;
					left = options.center.x - (width / 2.0) + (radius*Math.cos(angle)) * aspect_ratio;
					top = options.center.y + radius*Math.sin(angle) - (height / 2.0);
				}
				word_style.left = left + "px";
				word_style.top = top + "px";
			}
			
			
			// Don't render word if part of it would be outside the container
			if (options.removeOverflowing && (left < 0 || top < 0 || (left + width) > options.width || (top + height) > options.height)) {
				word_span.remove();
				return this;
			}
			
			
			already_placed_words.push(word_span);

			return this;

		}

		return this;
	}

	function overlapping(a, b){
		if(Math.abs(2.0*a.offsetLeft + a.offsetWidth - 2.0*b.offsetLeft - b.offsetWidth) < a.offsetWidth + b.offsetWidth){
			if(Math.abs(2.0*a.offsetTop + a.offsetHeight - 2.0*b.offsetTop - b.offsetHeight) < a.offsetHeight + b.offsetHeight) return true;
		}
		return false;
	}
	
	// Helper function to test if an element overlaps others
	function hitTest(elem, other_elems){
		// Pairwise overlap detection
		var i = 0;
		// Check elements for overlap one by one, stop and return false as soon as an overlap is found
		for(i = 0; i < other_elems.length; i++){
			if(overlapping(elem, other_elems[i])) return true;
		}
		return false;
	}

	ready(function(){
		document.querySelectorAll('[data-comp=wordCloud]').forEach(el => new WordCloud(el));
	});
	
})(window || this);

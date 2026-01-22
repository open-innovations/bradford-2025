(function(root){

	function ready(fn){
		// Version 1.1
		if(document.readyState != 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	};

	var styles = document.createElement('style');
	styles.innerHTML = '.filterable label { margin-right: 0.5rem; } .filterable input.filter { height: 2em; line-height: 2em; }';
	document.head.prepend(styles);

	function filterTable(v,rows){
		let lower = v.toLowerCase();
		for(let r = 0; r < rows.length; r++){
			let ok = false;
			for(let c = 0; c < rows[r].td.length; c++){
				let sort = rows[r].td[c].getAttribute('data-sort')||"";
				if(rows[r].td[c].innerHTML.toLowerCase().indexOf(lower) >= 0 || sort.toLowerCase().indexOf(lower) >= 0){
					ok = true;
					c = rows[r].td.length;
				}
			}
			if(ok){
				rows[r].tr.style.display = "";
			}else{
				rows[r].tr.style.display = "none";
			}
		}
	}

	function addTableFilter(el){
		console.log('add filter to ',el);
		// Add a class to this
		el.classList.add('filterable');
		// Get the table to filter
		let table = el.querySelector('.oi-table table');
		// Get the table rows
		let tr = table.querySelectorAll('tbody tr');
		// Make a label
		let lbl = document.createElement('label');
		lbl.innerHTML = "Filter the table below:";
		// Make an input text box
		let inp = document.createElement('input');
		inp.setAttribute('type','text');
		inp.classList.add('filter');
		// Add them to the top
		el.prepend(inp);
		el.prepend(lbl);

		let rows = [];
		for(let r = 0; r < tr.length; r++){
			rows[r] = {'tr':tr[r],'td':tr[r].querySelectorAll('td')};
		}
		// Add events
		inp.addEventListener('keyup',function(e){
			filterTable(e.target.value,rows);
		});
		inp.addEventListener('change',function(e){
			filterTable(e.target.value,rows);
		});
	}

	ready(function(){
		document.querySelectorAll('[data-table-filter=true]').forEach(el => addTableFilter(el));
	});
	
})(window || this);
(function(root){

	function ready(fn){
		// Version 1.1
		if(document.readyState != 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	};

	var styles = document.createElement('style');
	styles.innerHTML = '.filterable label { margin-right: 0.5rem; } .filterable input { height: 2em; line-height: 2em; font-size: 1em; }';
	document.head.prepend(styles);

	function filterTable(v,table){
		// Get the table rows at this point (in case any table sorting has happened)
		let tr = table.querySelectorAll('tbody tr');
		let rows = [];
		for(let r = 0; r < tr.length; r++){
			rows[r] = {'tr':tr[r],'td':tr[r].querySelectorAll('td')};
		}

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
			rows[r].tr.style.display = (ok) ? "" : rows[r].tr.style.display = "none";
		}
	}

	function addTableFilter(el){
		// Add a class to this
		el.classList.add('filterable');
		// Get the table to filter
		let table = el.querySelector('.oi-table table');
		// Make a label
		let lbl = document.createElement('label');
		lbl.innerHTML = "Filter the table:";
		// Make an input text box
		let inp = document.createElement('input');
		inp.setAttribute('type','text');
		inp.classList.add('filter');
		// Add them to the top
		el.prepend(inp);
		el.prepend(lbl);

		// Add events
		inp.addEventListener('keyup',function(e){
			filterTable(e.target.value,table);
		});
		inp.addEventListener('change',function(e){
			filterTable(e.target.value,table);
		});
	}

	ready(function(){
		document.querySelectorAll('[data-table-filter=true]').forEach(el => addTableFilter(el));
	});
	
})(window || this);
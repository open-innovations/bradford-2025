/*
	Open Innovations table saving v0.1
*/
(function(root){

	if(!root.OI) root.OI = {};
	if(!root.OI.ready){
		root.OI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}

	function saveToFile(txt,fileNameToSaveAs,mime){
		// Bail out if there is no Blob function
		if(typeof Blob!=="function") return this;

		let textFileAsBlob = new Blob([txt], {type:(mime||'text/plain')});

		function destroyClickedElement(event){ document.body.removeChild(event.target); }

		let dl = document.createElement("a");
		dl.download = fileNameToSaveAs;
		dl.innerHTML = "Download File";

		if(window.webkitURL != null){
			// Chrome allows the link to be clicked without actually adding it to the DOM.
			dl.href = window.webkitURL.createObjectURL(textFileAsBlob);
		}else{
			// Firefox requires the link to be added to the DOM before it can be clicked.
			dl.href = window.URL.createObjectURL(textFileAsBlob);
			dl.onclick = destroyClickedElement;
			dl.style.display = "none";
			document.body.appendChild(dl);
		}
		dl.click();
	}

	function getTableAsCSV(table){
		let csv = '';
		let th = table.querySelectorAll('thead th');
		let tr = table.querySelectorAll('tbody tr');
		for(let i = 0; i < th.length; i++){
			let cell = th[i].innerHTML.replace(/<span[^>]*>.*?<\/span>/,'').replace(/<[^\>]*>/g,'');
			csv += (i > 0 ? ',':'') + (cell.indexOf(',')>=0 ? '"':'') + cell + (cell.indexOf(',')>=0 ? '"':'');
		}
		csv += '\n';
		for(let r = 0; r < tr.length; r++){
			let td = tr[r].querySelectorAll('td');
			for(let c = 0; c < td.length; c++){
				let cell = td[c].innerHTML.replace(/<[^\>]*>/g,'').replace(/—/g,'-');
				csv += (c > 0 ? ',':'') + (cell.indexOf(',')>=0 ? '"':'') + cell + (cell.indexOf(',')>=0 ? '"':'');
			}
			csv += '\n';
		}
		return csv;
	}

	function SaveTable(el){
		// Make a button to save the table
		let a = el.querySelector('.more');
		if(!a){
			a = document.createElement('a');
			a.setAttribute('href','#');
			a.classList.add('more');
			a.innerHTML = '<span data-comp="pill">Download as CSV <span aria-hidden="true">→</span></span>';
			el.appendChild(a);
		}
		a.addEventListener('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			saveToFile(getTableAsCSV(el),el.getAttribute('data-filename')||'table.csv','text/csv');
		});
		
		return this;
	}

	root.OI.SaveTable = function(el){ return new SaveTable(el); };

})(window || this);

OI.ready(function(){
	let tables = document.querySelectorAll('.saveable-table');
	for(let i = 0; i < tables.length; i++) OI.SaveTable(tables[i]);
});
(function(root){

	function ready(fn){
		// Version 1.1
		if(document.readyState != 'loading') fn();
		else document.addEventListener('DOMContentLoaded', fn);
	};
	
	var styles = document.createElement('style');
	styles.innerHTML = '.tooltip {display:none;z-index:10000;color: var(--color,var(--color-white)); filter:drop-shadow(0px 1px 1px rgba(0,0,0,0.7));text-align:left; max-width:min(250px,100%);position:absolute;transform:translate3d(0,-100%,0);top:0;right:0;}.tooltip .inner { padding: 1em; background: var(--bgcolor,var(--color-black)); position: relative; transform: none; border: 0px; }.tooltip .arrow { position: absolute; width: 0px; height: 0px; border-top-width: 0.5em; border-top-style: solid; border-right-width: 0.5em; border-right-style: solid; border-left: 0.5em solid transparent; border-image: none; left: calc(100% - 2em); top: calc(100% - 1px); transform: translate3d(calc(-50% - 0px), 0px, 0px); border-right-color: transparent; border-top-color: var(--bgcolor,var(--color-black)); }';
	document.head.prepend(styles);
	
	function addTooltip(el){
		var tt = document.createElement('div');
		var flash = el.querySelector('.flash');
		tt.classList.add('tooltip');
		tt.innerHTML = '<div class="inner">' + flash.getAttribute('title') + '</div><div class="arrow"></div>'
		el.parentNode.append(tt);
		el.parentNode.style.position = "relative";
		function tt_close(){ tt.style.display = 'none'; }
		function tt_open(){ tt.style.display = 'block'; }
		function tt_toggle(){ tt.style.display = (tt.style.display=="block" ? "none":"block"); }
		flash.addEventListener('click',tt_toggle);
		flash.addEventListener('mouseover',tt_open);
		flash.addEventListener('mouseout',tt_close);
	}

	ready(function(){
		document.querySelectorAll('[data-flash=true]').forEach(el => addTooltip(el));
	});
	
})(window || this);
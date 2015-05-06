<?php

/**
 * A Custom Page List selector. For use with Babel only
 *
 */

class InputfieldPageListSelectBabel extends InputfieldPageListSelect {

	public function __construct() {
		parent::__construct();
		$this->init();
	}

	public function render() {
		
		static $process = null;
		if(is_null($process)) $process = $this->wire('modules')->get('ProcessPageList'); // prerequisite module

		if(!strlen($this->parent_id)) {
			return "<p class='error'>" . $this->_('Unable to render this field due to missing parent page in field settings.') . "</p>";
		}

		$settings = "{ " . 
			"mode: 'select', " . 
			"rootPageID: {$this->parent_id}, " . 
			"selectShowPath: " . ($this->showPath ? "true" : "false") . ", " . 
			"selectAllowUnselect: " . ($this->required ? "false" : "true") . ", " . 
			"selectStartLabel: \"{$this->startLabel}\", " . 
			"selectShowPageHeader: true, " . 
			"selectSelectLabel: \"{$this->selectLabel}\", " . 
			"selectUnselectLabel: \"{$this->unselectLabel}\", " .
			"moreLabel: \"{$this->moreLabel}\", " . 
			"selectCancelLabel: \"{$this->cancelLabel}\" " . 
		"}";

		$out =	
			"\n<input type='text' " . $this->getAttributesString() . " />" . 
			"\n<script>$(document).ready(function() { " . 
			"config.ProcessBabelTranslate.translateSelectSettings = {$settings}; " .
			"var t = $('#{$this->id}'); " . 
			"t.ProcessPageList(config.ProcessBabelTranslate.translateSelectSettings).hide()" . 
			"});</script>";


		$id = $this->attr('value');

		if (!$id) return $out;
		$value = $this->pages->get("$id");
		if ($value instanceof NullPage) return $out;

		$actions = array();

		$actions['edit'] = array(
			'label' => __('Edit'),
			'href' => $this->config->urls->admin . "page/edit/?id=$value",
			'class' => 'PageListActionEdit'
			);

		$actions['view'] = array(
			'label' => __('view'),
			'href' => $value->url,
			'class' => 'PageListActionView'
			);

		$actions['unlink'] = array(
			'label' => __('Unlink'),
			'href' => '#',
			'class' => 'PageListActionUnlink'
			);

		$out .= "<ul class='PageListActions actions PageListActionsBabel'>";
		foreach ($actions as $key => $action) $out .= '<li class="'. $action['class'] .'"><a href="'. $action["href"] .'">'. $action["label"] .'</a></li>';
		$out .= "</ul>";

		return $out; 
	}	
}	
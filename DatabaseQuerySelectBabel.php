<?php

/**
 * A helper module for Babel.
 * Adds a ON clause for SQL queries
 * and a an OFFSET too.
 * 
 */

class DatabaseQuerySelectBabel extends DatabaseQuerySelect {

	/**
	 * Setup the components of a SELECT query
	 *
	 */
	public function __construct() {
		$this->set('select', array()); 
		$this->set('join', array()); 
		$this->set('from', array()); 
		$this->set('leftjoin', array()); 
		$this->set('on', array());
		$this->set('where', array()); 
		$this->set('orderby', array()); 
		$this->set('groupby', array()); 
		$this->set('limit', array()); 
		$this->set('offset', array());
		$this->set('comment', ''); 
	}

	/**
	 * Return the resulting SQL ready for execution with the database
 	 *
	 */
	public function getQuery() {

		$sql = 	$this->getQuerySelect() . 
			$this->getQueryFrom() . 
			$this->getQueryJoin($this->join, "JOIN") . 
			$this->getQueryJoin($this->leftjoin, "LEFT JOIN") . 
			$this->getQueryOn() .
			$this->getQueryWhere() . 
			$this->getQueryGroupby() . 
			$this->getQueryOrderby() . 
			$this->getQueryLimit() . 
			$this->getQueryOffset(); 

		if($this->get('comment') && $this->wire('config')->debug) {
			// NOTE: PDO thinks ? and :str param identifiers in /* comments */ are real params
			// so we str_replace them out of the comment, and only support comments in debug mode
			$comment = str_replace(array('*/', '?', ':'), '', $this->comment); 
			$sql .= "/* $comment */";
		}

		return $sql; 
	}

	/**
	 * Get the ON portion of the query
	 *
	 */
	protected function getQueryOn() {
		if(!count($this->on)) return '';
		$on = $this->on; 
		$sql = "\nON (" . array_shift($on) . " ";
		foreach($on as $n) $sql .= " AND $n";
		$sql .= ") ";
		return $sql;
	}

	protected function getQueryOffset() {
		if(!count($this->offset)) return '';
		$offset = $this->offset; 
		$sql = "\nOFFSET " . reset($offset) . " ";
		return $sql; 
	}
}
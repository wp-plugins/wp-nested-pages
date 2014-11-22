<?php
/**
* Required Version Upgrades
*/
class NP_ActivateUpgrades {

	/**
	* New Version
	*/
	private $new_version;

	/**
	* Current Version
	*/
	private $current_version;


	public function __construct($new_version)
	{
		$this->new_version = $new_version;
		$this->setCurrentVersion();
		$this->addMenu();
		$this->convertMenuToID();
	}

	/**
	* Set the plugin version
	*/
	private function setCurrentVersion()
	{
		$this->current_version = ( get_option('nestedpages_version') )
			? get_option('nestedpages_version') : $this->new_version;
	}


	/**
	* Add an empty Nested Pages menu if there isn't one
	* @since 1.1.5
	*/
	private function addMenu()
	{
		if ( !get_option('nestedpages_menu') ){
			$menu_id = wp_create_nav_menu('Nested Pages');
			update_option('nestedpages_menu', $menu_id);
		}
	}

	
	/**
	* Convert existing nestedpages_menu option to menu ID rather than string/name
	* @since 1.1.5
	*/
	private function convertMenuToID()
	{
		if ( version_compare( $this->current_version, '1.1.5', '<' ) ){
			$menu_option = get_option('nestedpages_menu');
			$menu = get_term_by('name', $menu_option, 'nav_menu');
			if ( $menu ){
				delete_option('nestedpages_menu');
				update_option('nestedpages_menu', $menu->term_id);
			} else {
				delete_option('nestedpages_menu');
				$menu_id = wp_create_nav_menu('Nested Pages');
				update_option('nestedpages_menu', $menu_id);
			}
		}
	}


}
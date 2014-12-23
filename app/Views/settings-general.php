<?php
$allowsorting = get_option('nestedpages_allowsorting', array());
if ( $allowsorting == "" ) $allowsorting = array();

settings_fields( 'nestedpages-general' ); 
?>

<tr valign="top">
	<th scope="row"><?php _e('Nested Pages Version', 'nestedpages'); ?></th>
	<td><strong><?php echo get_option('nestedpages_version'); ?></strong></td>
</tr>
<tr valign="top">
	<th scope="row"><?php _e('Menu Name', 'nestedpages'); ?></th>
	<td>
		<input type="text" name="nestedpages_menu" id="nestedpages_menu" value="<?php echo $this->menu->name; ?>">
		<p><em><?php _e('Important: Once the menu name has changed, theme files should be updated to reference the new name.', 'nestedpages'); ?></em></p>
	</td>
</tr>
<tr valign="top">
	<th scope="row"><?php _e('Hide Default Pages', 'nestedpages'); ?></th>
	<td>
		<label>
			<input type="checkbox" id="nestedpages_hidedefault" name="nestedpages_hidedefault" <?php if ( get_option('nestedpages_hidedefault') == 'hide') echo 'checked'; ?> value="hide" >
			<?php _e('Hide Default Pages', 'nestedpages'); ?>
		</label>
	</td>
</tr>
<tr valign="top">
	<th scope="row"><?php _e('Allow Page Sorting', 'nestedpages'); ?></th>
	<td>
		<?php foreach ( $this->user_repo->allRoles() as $role ) : ?>
		<label>
			<input type="checkbox" name="nestedpages_allowsorting[]" value="<?php echo $role['name']; ?>" <?php if ( in_array($role['name'], $allowsorting) ) echo 'checked'; ?> >
			<?php echo $role['label']; ?>
		</label>
		<br />
		<?php endforeach; ?>
		<input type="hidden" name="nestedpages_menusync" value="<?php echo get_option('nestedpages_menusync'); ?>">
		<p><em><?php _e('Admins always have sorting ability. Only roles with access to the pages screen will be able to view/edit the Nested Pages interface.', 'nestedpages'); ?></em></p>
	</td>
</tr>
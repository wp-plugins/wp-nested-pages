/**
* Scripts Required by Nested Pages Plugin
* @author Kyle Phillips
*/
jQuery(function($){

	/**
	* ------------------------------------------------------------------------
	* Sortable and Toggline
	* ------------------------------------------------------------------------
	**/


	/**
	* Add the Submenu Toggles (using JS to prevent additional DB Queries)
	*/
	$(document).ready(function(){
		add_remove_submenu_toggles();
		np_set_borders();
	});
	
	/**
	* Toggle the Submenus
	*/
	$(document).on('click', '.child-toggle a', function(e){
		e.preventDefault();
		var submenu = $(this).parent('.child-toggle').parent('.row').siblings('ol');
		$(this).find('i').toggleClass('np-icon-arrow-down').toggleClass('np-icon-arrow-right');
		$(submenu).toggle();
		np_set_borders();
		np_sync_user_toggles();
	});

	/**
	* Toggle all pages (Expand All)
	*/
	$(document).on('click', '.nestedpages-toggleall a', function(e){
		e.preventDefault();
		if ( $(this).attr('data-toggle') == 'closed' )
		{
			$('.nestedpages ol li ol').show();
			$(this).attr('data-toggle', 'opened');
			$(this).text(nestedpages.collapse_text);
			$('.child-toggle i').removeClass('np-icon-arrow-right').addClass('np-icon-arrow-down');
			revert_quick_edit();
			np_set_borders();
		} else
		{
			$('.nestedpages ol li ol').hide();
			$(this).attr('data-toggle', 'closed');
			$(this).text(nestedpages.expand_text);
			$('.child-toggle i').removeClass('np-icon-arrow-down').addClass('np-icon-arrow-right');
			revert_quick_edit();
			np_set_borders();
		}
		np_sync_user_toggles();
	});

	/**
	* Toggle hidden pages
	*/
	$(document).on('click', '.np-toggle-hidden', function(e){
		e.preventDefault();
		var action = $(this).attr('href');
		if ( action === 'show' ){
			$(this).attr('href', 'hide');
			$(this).text(nestedpages.show_hidden);
			$('.np-hide').removeClass('shown').hide();
			np_set_borders();
		} else {
			$(this).attr('href', 'show');
			$(this).text(nestedpages.hide_hidden);
			$('.np-hide').addClass('shown').show();
			np_set_borders();
		}
	});

	/**
	* Tabs
	*/
	$('.np-tabs a').on('click', function(e){
		e.preventDefault();
		$('.np-tabs a').removeClass('active');
		$(this).addClass('active');
		
		var target = $(this).attr('href');
		$('.np-tabbed-content').hide();
		$(target).show();
	});
	
	/**
	* Fix :visible :first css limitation when toggling various options
	*/
	function np_set_borders()
	{
		var lists = $('.nplist');
		$('.page-row').removeClass('no-border');
		$.each(lists, function(){
			$(this).find('.page-row:visible:first').addClass('no-border');
		});
	}

	/**
	* Toggle between showing published pages and all
	*/
	$(document).on('click', '.np-toggle-publish', function(e){
		e.preventDefault();
		var target = $(this).attr('href');
		$('.np-toggle-publish').removeClass('active');
		$(this).addClass('active');
		if ( target == '#published' ){
			$('.nplist .page-row').hide();
			$('.nplist .published').show();
		} else {
			$('.nplist .page-row').show();
		}
	});


	/**
	* Toggle Responsive Action Buttons (Quick edit, add child, etc)
	*/
	$(document).on('click', '.np-toggle-edit', function(e){
		e.preventDefault();
		var buttons = $(this).siblings('.action-buttons');
		if ( $(buttons).is(':visible') ){
			$(this).removeClass('active');
			$(buttons).hide();
		} else {
			$(this).addClass('active');
			$(buttons).show();
		}
	});
	/**
	* Remove display block on action buttons when sizing up
	*/
	var actiondelay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		};
	})();
	$(window).resize(function() {
		actiondelay(function(){
			$('.action-buttons').removeAttr('style');
			$('.np-toggle-edit').removeClass('active');
		}, 500);
	});

	/**
	* Make the Menu sortable
	*/
	$(document).ready(function(){
		$('.sortable').not('.no-sort').nestedSortable({
			items : 'li',
			toleranceElement: '> .row',
			handle: '.handle',
			placeholder: "ui-sortable-placeholder",
			start: function(e, ui){
        		ui.placeholder.height(ui.item.height());
    		},
    		sort: function(e, ui){
    			update_placeholder_width(ui);
    		},
    		stop: function(e, ui){
    			setTimeout(
    				function(){
    					add_remove_submenu_toggles();
    					np_set_borders();
    			}, 100
    			);
    			submit_sortable_form();
    		},
    		update: function(e, ui){
    		}
		});
	});

	/**
	* Update the width of the placeholder
	*/
	function update_placeholder_width(ui)
	{
		var parentCount = $(ui.placeholder).parents('ol').length;
		var listWidth = $('.sortable').width();
		var offset = ( parentCount * 40 ) - 40;
		var newWidth = listWidth - offset;
		$(ui.placeholder).width(newWidth).css('margin-left', offset + 'px');
		update_list_visibility(ui);
	}

	/**
	* Make new list items visible
	*/
	function update_list_visibility(ui)
	{
		var parentList = $(ui.placeholder).parent('ol');
		if ( !$(parentList).is(':visible') ){
			$(parentList).show();
		}
	}


	/**
	* Add or Remove the submenu toggle after the list has changed
	*/
	function add_remove_submenu_toggles()
	{
		$('.child-toggle').each(function(i, v){
			var row = $(this).parent('.row').parent('li');

			if ( $(row).children('ol').length > 0 ){
				var icon = ( $(row).children('ol:visible').length > 0 ) ? 'np-icon-arrow-down' : 'np-icon-arrow-right';
				$(this).html('<a href="#"><i class="' + icon + '"></i></a>');
			} else {
				$(this).empty();
			}
		});
	}


	/**
	* Submit Sortable Form 
	* @todo add error div, pass message to it and show on error
	*/
	function submit_sortable_form()
	{
		$('#np-error').hide();
		$('#nested-loading').show();
		var syncmenu = ( $('.np-sync-menu').is(':checked') ) ? 'sync' : 'nosync';

		list = $('ol.sortable').nestedSortable('toHierarchy', {startDepthCount: 0});

		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data: {
				action : 'npsort',
				nonce : nestedpages.np_nonce,
				list : list,
				syncmenu : syncmenu
			},
			success: function(data){
				if (data.status === 'error'){
					$('#np-error').text(data.message).show();
					$('#nested-loading').hide();
				} else {
					$('#nested-loading').hide();
				}
			}
		});
	}





	/**
	* ------------------------------------------------------------------------
	* Sync Menu
	* ------------------------------------------------------------------------
	**/

	/**
	* Sync menu to catch any trash updates
	*/
	$(document).ready(function(){
		if ( nestedpages.syncmenu === '1' ) np_updated_sync_menu('sync'); 
	});

	/**
	* Sync Menu Checkbox Toggle
	*/
	$('.np-sync-menu').on('change', function(){
		var setting = ( $(this).is(':checked') ) ? 'sync' : 'nosync';
		np_updated_sync_menu(setting);
	});

	function np_updated_sync_menu(setting)
	{
		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data: {
				action : 'npsyncmenu',
				nonce : nestedpages.np_nonce,
				syncmenu : setting
			},
			success: function(data){
				if (data.status === 'error'){
					alert('There was an error saving the sync setting.')
				}
			}
		});
	}






	/**
	* ------------------------------------------------------------------------
	* Quick Edit - Pages
	* ------------------------------------------------------------------------
	**/

	// Show the form
	$(document).on('click', '.np-quick-edit', function(e){
		e.preventDefault();
		revert_quick_edit();
		set_quick_edit_data($(this));
	});

	// Hide the form when clicking modal overlay
	$(document).on('click', '.np-quick-edit-overlay', function(e){
		revert_quick_edit();
	});

	// Cancel the form
	$(document).on('click', '.np-cancel-quickedit', function(e){
		var row = $(this).parents('.page-row');
		revert_quick_edit(row);
		e.preventDefault();
	});

	// Submit the form
	$(document).on('click', '.np-save-quickedit', function(e){
		e.preventDefault();
		$('.row').removeClass('np-updated').removeClass('np-updated-show');
		var form = $(this).parents('form');
		$(this).attr('disabled', 'disabled');
		$(form).find('.np-qe-loading').show();
		submit_np_quickedit(form);
	});

	// Toggle the Taxonomies
	$(document).on('click', '.np-toggle-taxonomies', function(e){
		$(this).parents('form').find('.np-taxonomies').toggle();
		e.preventDefault();
	});

	// Toggle the Menu Options
	$(document).on('click', '.np-toggle-menuoptions', function(e){
		e.preventDefault();
		$(this).parents('form').find('.np-menuoptions').toggle();
	});

	// Toggle password/private
	$(document).on('change', '.keep_private', function(){
		if ( this.checked ){
			$('.post_password').val('').prop('readonly', true);
		} else {
			$('.post_password').prop('readonly', false);
		}
	});


	/**
	* Set Quick Edit data
	*/
	function set_quick_edit_data(item)
	{
		var data = {
			id : $(item).attr('data-id'),
			title : $(item).attr('data-title'),
			slug : $(item).attr('data-slug'),
			author : $(item).attr('data-author'),
			cs : $(item).attr('data-commentstatus'),
			status : $(item).attr('data-status'),
			template : $(item).attr('data-template'),
			month : $(item).attr('data-month'),
			day : $(item).attr('data-day'),
			year : $(item).attr('data-year'),
			hour : $(item).attr('data-hour'),
			minute : $(item).attr('data-minute'),
			navstatus : $(item).attr('data-navstatus'),
			npstatus : $(item).attr('data-np-status'),
			navtitle : $(item).attr('data-navtitle'),
			navtitleattr : $(item).attr('data-navtitleattr'),
			navcss : $(item).attr('data-navcss'),
			linktarget : $(item).attr('data-linktarget'),
			password : $(item).attr('data-password')
		};
		var parent_li = $(item).closest('.row').parent('li');

		// Add Array of Taxonomies to the data object
		data.h_taxonomies = [];
		data.f_taxonomies = [];
		var classes = $(parent_li).attr('class').split(/\s+/);
		for ( i = 0; i < classes.length; i++ ){
			if ( classes[i].substring(0, 3) === 'in-'){
				data.h_taxonomies.push(classes[i]);
			}
			if ( classes[i].substring(0, 4) === 'inf-' ){
				data.f_taxonomies.push(classes[i]);	
			}
		}
		
		// Append the form to the list item
		if ( $(parent_li).children('ol').length > 0 ){
			var child_ol = $(parent_li).children('ol');
			var newform = $('.quick-edit-form').clone().insertBefore(child_ol);
		} else {
			var newform = $('.quick-edit-form').clone().appendTo(parent_li);
		}

		var row = $(newform).siblings('.row').hide();
		populate_quick_edit(newform, data);
	}


	/**
	* Populate the Quick Edit Form and show it
	*/
	function populate_quick_edit(form, data)
	{
		$(form).find('.np_id').val(data.id);
		$(form).find('.np_title').val(data.title);
		$(form).find('.np_slug').val(data.slug);
		$(form).find('.np_author select').val(data.author);
		$(form).find('.np_template').val(data.template);
		$(form).find('.np_status').val(data.status);
		$(form).find('.np_nav_title').val(data.navtitle);
		$(form).find('.np_title_attribute').val(data.navtitleattr);
		$(form).find('.np_nav_css_classes').val(data.navcss);
		$(form).find('.post_password').val(data.password);
		if ( data.cs === 'open' ) $(form).find('.np_cs').prop('checked', 'checked');

		if ( data.status === 'private' ){
			$(form).find('.post_password').prop('readonly', true);
			$(form).find('.keep_private').prop('checked', true);
		}

		if ( data.npstatus === 'hide' ){
			$(form).find('.np_status').prop('checked', 'checked');
		} else {
			$(form).find('.np_status').removeAttr('checked');
		}
		
		if ( data.navstatus === 'hide' ) {
			$(form).find('.np_nav_status').prop('checked', 'checked');
		} else {
			$(form).find('.np_nav_status').removeAttr('checked');
		}

		if ( data.linktarget === "_blank" ) {
			$(form).find('.link_target').prop('checked', 'checked');
		} else {
			$(form).find('.link_target').removeAttr('checked');
		}

		if ( data.status === "private" ) {
			$(form).find('.np_status').val('publish');
		}
		
		// Date Fields
		$(form).find('select[name="mm"]').val(data.month);
		$(form).find('input[name="jj"]').val(data.day);
		$(form).find('input[name="aa"]').val(data.year);
		$(form).find('input[name="hh"]').val(data.hour);
		$(form).find('input[name="mn"]').val(data.minute);

		// Populate Hierarchical Taxonomy Checkboxes
		if ( data.hasOwnProperty('h_taxonomies') ){
			var taxonomies = data.h_taxonomies;
			for ( i = 0; i < taxonomies.length; i++ ){
				var tax = '#' + taxonomies[i];
				$(form).find(tax).prop('checked', 'checked');
			}
		}

		show_quick_edit_overlay();

		$(form).show();

		// Populate Flat Taxonomies (makes ajax request, so do this after showing form)
		if ( data.hasOwnProperty('f_taxonomies') ){
			create_taxonomy_object(data.f_taxonomies);	
			set_wp_suggest(form);		
		}
	}


	/**
	* Create object of flat taxonomies out of class names
	*/
	function create_taxonomy_object(taxonomies)
	{
		var out = "";
		var terms = {};
		for ( i = 0; i < taxonomies.length; i++ ){
			// Get the term
			var tax_array = taxonomies[i].split('-'); // split the string into an array
			var splitter = tax_array.indexOf('nps'); // find the index of the name splitter
			var term = tax_array.splice(splitter + 1); // Splice off the name
			term = term.join('-'); // Join the name back into a string

			// Get the taxonomy
			var tax = taxonomies[i].split('-').splice(0, splitter);
			tax.shift('inf');
			var taxonomy = tax.join('-');				

			// Add taxonomy array to object
			if ( !(taxonomy in terms) ){
				terms[taxonomy] = [];
			}
			// push term to taxonomy array
			var term_array = terms[taxonomy];
			term_array.push(term);
		}
		get_taxonomy_names(terms);
	}



	/**
	* Get Taxonomy Names
	* @param array of term slugs
	*/
	function get_taxonomy_names(taxonomies)
	{
		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data : {
				action : 'gettax',
				nonce : nestedpages.np_nonce,
				terms : taxonomies
			},
			success: function(data){
				populate_flat_taxonomies(data.terms);
			}
		});
	}

	/**
	* Populate flat taxonomy textareas
	* @param object
	*/
	function populate_flat_taxonomies(terms)
	{
		$.each(terms, function(i, v){
			var textarea = $('#' + i);
			$(textarea).val(v.join(','));
		});
	}


	/**
	* Set WP Taxonomy Suggest (Flat taxonomies)
	*/
	function set_wp_suggest(form)
	{
		var tagfields = $(form).find('[data-autotag]');
		$.each(tagfields, function(i, v){
			var taxonomy = $(this).attr('data-taxonomy');
			$(this).suggest(ajaxurl + '?action=ajax-tag-search&tax=' + taxonomy , {multiple:true, multipleSep: ","});
		});
	}


	/**
	* Remove the quick edit form and restore the row
	*/
	function revert_quick_edit()
	{
		$('.np-quickedit-error').hide();
		remove_quick_edit_overlay();
		$('.sortable .quick-edit').remove();
		$('.row').show();
	}

	/**
	* Show the Quick edit overlay
	*/
	function show_quick_edit_overlay()
	{
		$('body').append('<div class="np-quick-edit-overlay"></div>');
		setTimeout(function(){
			$('.np-quick-edit-overlay').addClass('active');
		}, 50);
	}

	/**
	* Remove the Quick edit overlay
	*/
	function remove_quick_edit_overlay()
	{
		$('.np-quick-edit-overlay').removeClass('active').remove();
	}


	/**
	* Submit the Quick Edit Form
	*/
	function submit_np_quickedit(form)
	{
		$('.np-quickedit-error').hide();
		var syncmenu = ( $('.np-sync-menu').is(':checked') ) ? 'sync' : 'nosync';

		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data: $(form).serialize() + '&action=npquickedit&nonce=' + nestedpages.np_nonce + '&syncmenu=' + syncmenu,
			success: function(data){
				console.log(data);
				if (data.status === 'error'){
					np_remove_qe_loading(form);
					$(form).find('.np-quickedit-error').text(data.message).show();
				} else {
					np_remove_qe_loading(form);
					np_update_qe_data(form, data.post_data);
					np_qe_update_animate(form);
				}
			}
		});
	}


	/**
	* Update Row Data after Quick Edit
	*/
	function np_update_qe_data(form, data)
	{
		var row = $(form).parent('.quick-edit').siblings('.row');
		$(row).find('.title').text(data.post_title);
		
		var status = $(row).find('.status');
		if ( (data._status !== 'publish') && (data._status !== 'future') ){
			$(status).text('(' + data._status + ')');
		} else if (data.keep_private === 'private') {
			$(status).text('(' + data.keep_private + ')');
		} else {
			$(status).text('');
		}

		// Password Lock Icon
		if ( data.post_password !== "" ){
			var statustext = $(status).text();
			statustext += ' <i class="np-icon-lock"></i>';
			$(status).html(statustext);
		}

		// Hide / Show in Nav
		var nav_status = $(row).find('.nav-status');
		if ( (data.nav_status == 'hide') ){
			$(nav_status).text('(Hidden)');
		} else {
			$(nav_status).text('');
		}

		// Hide / Show in Nested Pages
		var li = $(row).parent('li');
		if ( (data.np_status == 'hide') ){
			$(li).addClass('np-hide');
			$(row).find('.status').after('<i class="np-icon-eye-blocked"></i>');
		} else {
			$(li).removeClass('np-hide');
			$(row).find('.np-icon-eye-blocked').remove();
		}

		var button = $(row).find('.np-quick-edit');

		$(button).attr('data-id', data.post_id);
		$(button).attr('data-template', data.page_template);
		$(button).attr('data-title', data.post_title);
		$(button).attr('data-slug', data.post_name);
		$(button).attr('data-commentstatus', data.comment_status);
		$(button).attr('data-status', data._status);
		
		// Private Status
		if ( data.keep_private === 'private' ) {
			$(button).attr('data-status', 'private');
		}
		
		$(button).attr('data-author', data.post_author);
		$(button).attr('data-np-status', data.np_status);
		$(button).attr('data-password', data.post_password);
		
		$(button).attr('data-navstatus', data.nav_status);
		$(button).attr('data-navtitle', data.np_nav_title);
		$(button).attr('data-linktarget', data.link_target);
		$(button).attr('data-navtitleattr', data.np_title_attribute);
		$(button).attr('data-navcss', data.np_nav_css_classes);

		$(button).attr('data-month', data.mm);
		$(button).attr('data-day', data.jj);
		$(button).attr('data-year', data.aa);
		$(button).attr('data-hour', data.hh);
		$(button).attr('data-minute', data.mn);

		np_remove_taxonomy_classes(li);
		np_add_category_classes(li, data);
		np_add_h_taxonomy_classes(li, data);
		np_add_f_taxonomy_classes(li, data);

	}

	
	/**
	* Remove taxonomy classes from the row
	*/
	function np_remove_taxonomy_classes(row)
	{
		taxonomies = [];
		var classes = $(row).attr('class').split(/\s+/);
		for ( i = 0; i < classes.length; i++ ){
			if ( classes[i].substring(0, 3) === 'in-'){
				$(row).removeClass(classes[i]);
			}
			if ( classes[i].substring(0, 4) === 'inf-'){
				$(row).removeClass(classes[i]);
			}
		}
	}


	/**
	* Add category classes to the row
	*/
	function np_add_category_classes(row, data)
	{
		if ( data.hasOwnProperty('post_category') ){
			var cats = data.post_category;
			for ( i = 0; i < cats.length; i++ ){
				var taxclass = 'in-category-' + cats[i];
				$(row).addClass(taxclass);
			}
		}
	}


	/**
	* Add Hierarchical Taxonomy Classes to the row
	*/
	function np_add_h_taxonomy_classes(row, data)
	{
		if ( data.hasOwnProperty('tax_input') )
		{
			var taxonomies = data.tax_input;
			$.each(taxonomies, function(tax, terms){
				for (i = 0; i < terms.length; i++){
					var taxclass = 'in-' + tax + '-' + terms[i];
					$(row).addClass(taxclass);
				}
			});

		}
	}


	/**
	* Add Flat Taxonomy Classes to the row
	*/
	function np_add_f_taxonomy_classes(row, data)
	{
		if ( data.hasOwnProperty('flat_tax') )
		{
			var taxonomies = data.flat_tax;
			$.each(taxonomies, function(tax, terms){
				for (i = 0; i < terms.length; i++){
					var taxclass = 'inf-' + tax + '-nps-' + terms[i];
					$(row).addClass(taxclass);
				}
			});

		}
	}


	/**
	* Remove loading state from Quick Edit form
	*/
	function np_remove_qe_loading(form)
	{
		$(form).find('.np-save-quickedit, .np-save-quickedit-redirect').removeAttr('disabled');
		$(form).find('.np-qe-loading').hide();
	}

	/**
	* Show quick edit update animation
	*/
	function np_qe_update_animate(form)
	{	
		var row = $(form).parent('.quick-edit').siblings('.row');
		$(row).addClass('np-updated');
		$(row).show();
		$(form).parent('.quick-edit').remove();
		remove_quick_edit_overlay();
		np_set_borders();
		setTimeout(function(){
			$(row).addClass('np-updated-show');
		}, 1500);
	}





	/**
	* ------------------------------------------------------------------------
	* Quick Edit - Redirect
	* ------------------------------------------------------------------------
	**/
	$(document).on('click', '.np-quick-edit-redirect', function(e){
		e.preventDefault();
		revert_quick_edit();
		set_redirect_quick_edit_data($(this));
	});

	// Submit the form
	$(document).on('click', '.np-save-quickedit-redirect', function(e){
		e.preventDefault();
		$('.row').removeClass('np-updated').removeClass('np-updated-show');
		var form = $(this).parents('form');
		$(this).attr('disabled', 'disabled');
		$(form).find('.np-qe-loading').show();
		submit_np_quickedit_redirect(form);
	});

	/**
	* Set the Redirect Quick edit data & create form
	*/
	function set_redirect_quick_edit_data(item)
	{
		var data = {
			id : $(item).attr('data-id'),
			url : $(item).attr('data-url'),
			title : $(item).attr('data-title'),
			status : $(item).attr('data-status'),
			navstatus : $(item).attr('data-navstatus'),
			npstatus : $(item).attr('data-np-status'),
			linktarget : $(item).attr('data-linktarget'),
			parentid : $(item).attr('data-parentid'),
			navtitleattr : $(item).attr('data-navtitleattr'),
			navcss : $(item).attr('data-navcss')
		};
		var parent_li = $(item).closest('.row').parent('li');
		
		// Append the form to the list item
		if ( $(parent_li).children('ol').length > 0 ){
			var child_ol = $(parent_li).children('ol');
			var newform = $('.quick-edit-form-redirect').clone().insertBefore(child_ol);
		} else {
			var newform = $('.quick-edit-form-redirect').clone().appendTo(parent_li);
		}

		var row = $(newform).siblings('.row').hide();
		$(newform).show();

		populate_redirect_quick_edit(newform, data);
	}

	/**
	* Populate the Quick Edit Form
	*/
	function populate_redirect_quick_edit(form, data)
	{
		$(form).find('.np_id').val(data.id);
		$(form).find('.np_title').val(data.title);
		$(form).find('.np_author select').val(data.author);
		$(form).find('.np_status').val(data.status);
		$(form).find('.np_content').val(data.url);
		$(form).find('.np_parent_id').val(data.parentid);
		$(form).find('.np_title_attribute').val(data.navtitleattr);
		$(form).find('.np_nav_css_classes').val(data.navcss);

		if ( data.npstatus === 'hide' ){
			$(form).find('.np_status').prop('checked', 'checked');
		} else {
			$(form).find('.np_status').removeAttr('checked');
		}
		
		if ( data.navstatus === 'hide' ) {
			$(form).find('.np_nav_status').prop('checked', 'checked');
		} else {
			$(form).find('.np_nav_status').removeAttr('checked');
		}

		if ( data.linktarget === "_blank" ) {
			$(form).find('.link_target').prop('checked', 'checked');
		} else {
			$(form).find('.link_target').removeAttr('checked');
		}

		show_quick_edit_overlay();

		$(form).show();
	}


	/**
	* Submit the Quick Edit Form for Redirects
	*/
	function submit_np_quickedit_redirect(form)
	{
		$('.np-quickedit-error').hide();
		var syncmenu = ( $('.np-sync-menu').is(':checked') ) ? 'sync' : 'nosync';
		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data: $(form).serialize() + '&action=npquickeditredirect&nonce=' + nestedpages.np_nonce + '&syncmenu=' + syncmenu,
			success: function(data){
				console.log(data);
				if (data.status === 'error'){
					np_remove_qe_loading(form);
					$(form).find('.np-quickedit-error').text(data.message).show();
				} else {
					np_remove_qe_loading(form);
					np_update_qe_redirect_data(form, data.post_data);
					np_qe_update_animate(form);
				}
			},
			error: function(){
				np_remove_qe_loading(form);
				$(form).find('.np-quickedit-error').text('The form could not be saved at this time.').show();
			}
		});
	}


	/**
	* Update Row Data after Quick Edit (Redirect)
	*/
	function np_update_qe_redirect_data(form, data)
	{
		var row = $(form).parent('.quick-edit').siblings('.row');
		$(row).find('.title').html(data.post_title + ' <i class="np-icon-link"></i>');
		
		var status = $(row).find('.status');
		if ( (data._status !== 'publish') && (data._status !== 'future') ){
			$(status).text('(' + data._status + ')');
		} else {
			$(status).text('');
		}

		// Hide / Show in Nav
		var nav_status = $(row).find('.nav-status');
		if ( (data.nav_status == 'hide') ){
			$(nav_status).text('(Hidden)');
		} else {
			$(nav_status).text('');
		}

		// Hide / Show in Nested Pages
		var li = $(row).parent('li');
		if ( (data.np_status == 'hide') ){
			$(li).addClass('np-hide');
			$(row).find('.status').after('<i class="np-icon-eye-blocked"></i>');
		} else {
			$(li).removeClass('np-hide');
			$(row).find('.np-icon-eye-blocked').remove();
		}

		var button = $(row).find('.np-quick-edit-redirect');

		$(button).attr('data-id', data.post_id);
		$(button).attr('data-title', data.post_title);
		$(button).attr('data-url', data.post_content);
		$(button).attr('data-status', data._status);
		$(button).attr('data-navstatus', data.nav_status);
		$(button).attr('data-np-status', data.np_status);
		$(button).attr('data-linktarget', data.link_target);
		$(button).attr('data-navtitleattr', data.np_title_attribute);
		$(button).attr('data-navcss', data.np_nav_css_classes);
	}





	/**
	* ------------------------------------------------------------------------
	* Add new Redirect link (modal)
	* ------------------------------------------------------------------------
	**/
	$(document).on('click', '.open-redirect-modal', function(e){
		e.preventDefault();
		var parent_id = $(this).attr('data-parentid');
		$('#np-link-modal').find('input').val('');
		$('#np-link-modal .parent_id').val(parent_id);
		if (parent_id === '0'){
			$('#np-add-link-title').text(nestedpages.add_link);
		} else {
			$('#np-add-link-title').text(nestedpages.add_child_link);
		}
		$('#np-link-modal').modal('show');
	});

	$(document).on('click', '.np-save-link', function(e){
		e.preventDefault();
		$('.np-new-link-error').hide();
		$('.np-link-loading').show();
		$(this).attr('disabled', 'disabled');
		np_save_new_link();
	});

	/**
	* Remove loading state from link form
	*/
	function np_remove_link_loading()
	{
		$('.np-link-loading').hide();
		$('.np-save-link').removeAttr('disabled');
	}

	/**
	* Set new link data
	*/
	function np_save_new_link()
	{
		$('.np-new-link-error').hide();
		var data = $('.np-new-link-form').serialize();
		var syncmenu = ( $('.np-sync-menu').is(':checked') ) ? 'sync' : 'nosync';

		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data: data + '&action=npnewredirect&nonce=' + nestedpages.np_nonce + '&syncmenu=' + syncmenu,
			success: function(data){
				console.log(data);
				if (data.status === 'error'){
					np_remove_link_loading();
					$('.np-new-link-error').text(data.message).show();
				} else {
					np_remove_link_loading();
					np_create_redirect_row(data.post_data);
				}
			}
		});
	}

	/**
	* Create the new row and append where needed
	*/
	function np_create_redirect_row(data)
	{
		var html = '<li id="menuItem_' + data.id + '" class="page-row';
		if ( data._status === 'publish' ){
			html += ' published';
		}
		html += '">'

		html += '<div class="row"><div class="child-toggle"></div><div class="row-inner"><i class="np-icon-sub-menu"></i><i class="handle np-icon-menu"></i><a href="' + data.np_link_content + '" class="page-link page-title" target="_blank"><span class="title">' + data.np_link_title + ' <i class="np-icon-link"></i></span>';

		// Post Status
		if ( data._status !== 'publish' ){
			html += '<span class="status">' + data._status + '</span>';
		} else {
			html += '<span class="status"></span>';
		}

		// Nested Pages Status
		if ( data.np_status === "hide" ){
			html += '<i class="np-icon-eye-blocked"></i>';
		}

		// Nav Menu Status
		if ( data.nav_status === "hide" ){
			html += '<span class="nav-status">(Hidden)</span>';
		} else {
			html += '<span class="nav-status"></span>';
		}

		// Quick Edit Button
		html += '</a><a href="#" class="np-toggle-edit"><i class="np-icon-pencil"></i></a><div class="action-buttons"><a href="#" class="np-btn np-quick-edit-redirect" ';
		html +=	'data-id="' + data.id + '"'; 
		html += 'data-parentid="' + data.parent_id + '"';
		html += 'data-title="' + data.np_link_title + '" ';
		html += 'data-url="' + data.np_link_content + '" ';
		html += 'data-status="' + data._status + '" ';
		html += 'data-np-status="' + data.np_status + '" ';
		html += 'data-navstatus="' + data.nav_status + '" ';
		html += 'data-linktarget="' + data.link_target + '">'
		html += 'Quick Edit</a>';
		html += '</div></div></div></li>';

		if ( data.parent_id === "0" ){
			$('.nplist:first li:first').after(html);
		} else {
			np_append_child_link(html, data);
		}

		$('#np-link-modal').modal('hide');

		var row = $('#menuItem_' + data.id).find('.row');
		np_qe_update_redirect_animate(row);
	}


	/**
	* Append a child link
	*/
	function np_append_child_link(html, data)
	{
		var parent_row = $('#menuItem_' + data.parent_id);
		if ( $(parent_row).children('ol').length === 0 ){
			html = '<ol class="sortable nplist" style="display:block;">' + html + '</ol>';
			$(parent_row).append(html);
		} else {
			$(parent_row).find('ol:first').prepend(html);
		}
		add_remove_submenu_toggles();
		np_sync_user_toggles();
	}


	/**
	* Show quick edit update animation after adding redirect
	*/
	function np_qe_update_redirect_animate(row)
	{	
		$(row).addClass('np-updated');
		np_set_borders();
		setTimeout(function(){
			$(row).addClass('np-updated-show');
		}, 1500);
	}





	/**
	* ------------------------------------------------------------------------
	* Sync User's Toggled Pages
	* ------------------------------------------------------------------------
	**/

	/** 
	* Get an array of visible pages' ids
	* @return array
	*/
	function np_get_visible_rows()
	{
		var visible_ids = [];
		var visible = $('.page-row:visible');
		$.each(visible, function(i, v){
			var id = $(this).attr('id');
			visible_ids.push(id.replace("menuItem_", ""));
		});
		return visible_ids;
	}

	/**
	* Sync the user's stored toggle status
	*/
	function np_sync_user_toggles()
	{
		var ids = np_get_visible_rows();
		$.ajax({
			url: ajaxurl,
			type: 'post',
			datatype: 'json',
			data: {
				action : 'npnesttoggle',
				nonce : nestedpages.np_nonce,
				ids : ids
			},
			success: function(data){
				if ( data.status !== 'success' ){
					console.log('There was an error saving toggled pages.');
				}
			}
		});
	}



}); //$
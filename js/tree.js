
let pdf_link_prefix = 'https://peaceagreements.org/viewmasterdocument/'
let coding_link_prefix = 'https://peaceagreements.org/view/'

// Store user's navigation state
let breadcrumbs = {};
// Store entity types in tree depth order
let type_list = ['country','agreement','provision','report','section'];

// Called when user selects an entity in a table row
function select(index,type,text,wrapper_id) {	
	breadcrumbs[type] = [index,text];
	populate_type(type_list[type_list.indexOf(type)+1],"type");
	depopulate_table(wrapper_id);
	depopulate_table("breadcrumbs_table");
	populate_breadcrumbs(breadcrumbs,"breadcrumbs_table")
	if (type == 'country') {
		populate_table(wrapper_id, get_agreements(index),'agreement');
	} else if (type == 'agreement') {
		populate_table(wrapper_id, get_provisions(breadcrumbs['country'][0],index),'provision');
	} else if (type == 'provision') {
		populate_table(wrapper_id, get_reports(breadcrumbs['country'][0],breadcrumbs['agreement'][0],index),'report');
	} else if (type == 'report') {
		populate_table(wrapper_id, get_sections(breadcrumbs['country'][0],breadcrumbs['agreement'][0],breadcrumbs['provision'][0],index),'section');
	}
}

// Called when user selects a breadcrumb
function select_breadcrumb(entity_index,type,text,wrapper_id) {
	// Remove crumbs beyond the selected type
	type_index = type_list.indexOf(type);
	for (let i = type_index+1; i < type_list.length; i++) {
		if (type_list[i] in breadcrumbs) {
			delete breadcrumbs[type_list[i]];
		}
	}
	populate_type(type_list[type_index+1],"type");
	depopulate_table(wrapper_id);
	depopulate_table("breadcrumbs_table");
	populate_breadcrumbs(breadcrumbs,"breadcrumbs_table")
	country_index = breadcrumbs['country'][0];
	if ('agreement' in breadcrumbs) {
		agreement_index = breadcrumbs['agreement'][0];
	}
	if ('provision' in breadcrumbs) {
		provision_index = breadcrumbs['provision'][0];
	}
	if (type == 'country') {
		populate_table(wrapper_id, get_agreements(entity_index),'agreement');
	} else if (type == 'agreement') {
		populate_table(wrapper_id, get_provisions(country_index,entity_index),'provision');
	} else if (type == 'provision') {
		populate_table(wrapper_id, get_reports(country_index,agreement_index,entity_index),'report');
	} else if (type == 'report') {
		populate_table(wrapper_id, get_sections(country_index,agreement_index,provision_index,entity_index),'section');
	}
}

function populate_breadcrumbs(breadcrumbs,wrapper_id) {
	depopulate_table(wrapper_id);
  	let table = document.getElementById(wrapper_id);
	let row = table.insertRow();
	
	// Add countries item to get back to the beginning
	let cell = row.insertCell();
	cell.id = 'countries';
	cell.name = 'countries';	
	cell.addEventListener('click', function(){go_home();}, false);
	cell.className = "breadcrumb"
	cell.appendChild(document.createTextNode('Countries'));

	for (type in breadcrumbs){
		let cell = row.insertCell();
		cell.id = breadcrumbs[type][0];
		cell.name = type;	
		let text = document.createTextNode(breadcrumbs[type][1].textContent);
		cell.addEventListener('click', function(){select_breadcrumb(this.id,this.name,text,"wrapper_table");}, false);
		cell.className = "breadcrumb"
		cell.appendChild(text);
	}	
}

// Populate the main entity table
function populate_table(wrapper_id, siblings, type) {
  	let table = document.getElementById(wrapper_id);
    for (const [i, sib] of siblings.entries()) {
		let row = table.insertRow();
		let cell = row.insertCell();
		cell.id = i;
		cell.name = type;
		cell.className = "horizontalSplit"
		let text = ''
		
		if (type == 'country') {
			text = document.createTextNode(sib.name);
			cell.appendChild(text);
		} else if (type == 'agreement') {
			text = document.createTextNode(sib.id + ' - ' + sib.name + ' - ' + formatDate(sib.date));
			cell.appendChild(text);
			let blank = row.insertCell()
			blank.appendChild(document.createTextNode('\u2003'))
			let pdf_link_cell = row.insertCell();
			pdf_link_cell.appendChild(createAgreementPDFLinkNode(sib.id));
			blank = row.insertCell() //blank
			blank.appendChild(document.createTextNode('\u2003'))
			let coding_link_cell = row.insertCell();
			coding_link_cell.appendChild(createAgreementCodingLinkNode(sib.id));
		} else if (type == 'provision') {
			text = document.createTextNode(sib.number + ' - ' + sib.text);
			cell.appendChild(text);
		} else if  (type == 'report') {
			// report
			text = document.createTextNode(sib.name + ' - ' + formatDate(sib.date));
			cell.appendChild(text);
		} else {
			// section
			text = document.createTextNode(sib.number + ' - ' + sib.text);
			cell.appendChild(text);
		}
		if (type != 'section') {
			cell.addEventListener('click', function(){select(this.id,this.name,text,wrapper_id);}, false);
			cell.style.cursor = "pointer";
		} else {
			cell.style.cursor = "not-allowed";
		}
	}
}

function formatDate(date) {
	// Reformat the integer YYYYMMDD date to DD/MM/YYYY
	return date.slice(6, 8)  + '/' + date.slice(4, 6) + '/' + date.slice(0, 4)
}

function createAgreementPDFLinkNode(agreement_id) {
	// Create a deep link into PA-X agreement
	let a = document.createElement('a'); 
	let link = document.createTextNode('View PDF');
	a.appendChild(link); 
	a.title = 'Deep link to agreement PDF'; 
	a.target = '_blank'; 
	// Build the URL
	let url = pdf_link_prefix + agreement_id;
	a.href = url; 
	return a
}

function createAgreementCodingLinkNode(agreement_id) {
	// Create a deep link into PA-X agreement
	let a = document.createElement('a'); 
	let link = document.createTextNode('View Coding');
	a.appendChild(link); 
	a.title = 'Deep link to agreement coding page'; 
	a.target = '_blank'; 
	// Build the URL
	let url = coding_link_prefix + agreement_id;
	a.href = url; 
	return a
}

function populate_type(type,element_id) {
	if (type == 'country') {
		str = "COUNTRY"
	} else if (type == 'provision')  {
		str = 'AGREEMENT ' + type.toUpperCase() + "S"
	} else if (type == 'report')  {
		str = type.toUpperCase() + "S";
	} else if (type == 'section')  {
		str = 'REPORT ' + type.toUpperCase() + "S"
	} else {
		str = type.toUpperCase() + "S"
	}
	document.getElementById(element_id).innerText = str
}

// Currently country level
function go_home(){
 	breadcrumbs = {}
 	populate_type('country',"type")
 	depopulate_table('breadcrumbs_table');
 	depopulate_table('wrapper_table');
	populate_table('wrapper_table', get_countries(), 'country')
}

// Clear table
function depopulate_table(wrapper_id) {
	try {
		let wrapper = document.getElementById(wrapper_id);
		wrapper.innerHTML = ""
	} catch(err){
	}		
}

// Get the countries in the tree
function get_countries() {
	let countries = tree['countries'];
	return countries;
}

// Get the agreements of a country
function get_agreements(country_index) {
	let agreements = get_countries()[country_index]['agreements'];
	return agreements;
}

// Get the provisions of an agreement
function get_provisions(country_index,agreement_index) {
	let provisions = get_agreements(country_index)[agreement_index]['provisions'];
	return provisions;
}

// Get the reports of a provision
function get_reports(country_index,agreement_index,provision_index) {
	let reports = get_provisions(country_index,agreement_index)[provision_index]['reports'];
	return reports;
}

// Get the sections of a report
function get_sections(country_index,agreement_index,provision_index,report_index) {
	let sections = get_reports(country_index,agreement_index,provision_index)[report_index]['sections'];
	return sections;
}

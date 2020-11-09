import {createCustomElement, actionTypes} from '@servicenow/ui-core';
const {COMPONENT_BOOTSTRAPPED} = actionTypes;
import snabbdom from '@servicenow/ui-renderer-snabbdom';
import styles from './styles.scss';
import { createHttpEffect } from '@servicenow/ui-effect-http';
import '@servicenow/now-template-card'

const view = (state, {updateState}) => {

	const {incidentList} = state;

	function cardListToHTML(list)
	{
		let output = [];
		
		if ((list != null) && (list.length > 0))
		{
			list.forEach(element => {
				output.push(
					<now-template-card-assist
							tagline={{ "icon": "tree-view-long-outline", "label": "Incident" }}
							actions={[{ "id": "share", "label": "Copy URL" }, { "id": "close", "label": "Mark Complete" }]}
							heading={{ "label": element["short_description"] }}
							content={[{ "label": "Number", "value": { "type": "string", "value": element["number"] }}, 
									  { "label": "State", "value": { "type": "string", "value": element["state"] } }, 
									  { "label": "Assignment group", "value": { "type": "string", "value": element["assignment_group"] } }, 
									  { "label": "Assigned To", "value": { "type": "string", "value": element["assigned_to"] } }]} 
							contentItemMinWidth="300"
							footerContent={{ "label": "Updated", "value": element["updated_on"] }} 
							configAria={{}}>
							</now-template-card-assist>
					);
			});
			return output;
		}
		else return "Loading data...";
	}

	return (
		<div>
			<div>{cardListToHTML(incidentList)}</div>
		</div>
	);
};

createCustomElement('x-550126-incident-list', {
	actionHandlers: {
		[COMPONENT_BOOTSTRAPPED]: (coeffects) => {
			const { dispatch } = coeffects;
		
			dispatch('FETCH_LATEST_INCIDENT', {});
		},
		'FETCH_LATEST_INCIDENT': createHttpEffect('api/now/table/incident?sysparm_display_value=true', {
			method: 'GET',
			successActionType: 'FETCH_LATEST_INCIDENT_SUCCESS'
		}),
		'FETCH_LATEST_INCIDENT_SUCCESS': (coeffects) => {
			const { action, updateState } = coeffects;
			const { result } = action.payload;

			let incidentList = [];

			class IncidentEntry {
				constructor(source) {
					const {
						short_description,
						number,
						state,
						assignment_group,
						assigned_to,
						sys_updated_on } = source;

					this.short_description = short_description;
					this.number = number;
					this.state = state;
					this.assignment_group = assignment_group["display_value"];
					this.assigned_to = assigned_to["display_value"];
					this.updated_on = sys_updated_on;
				}
			}

			result.forEach(source => {
				incidentList.push(new IncidentEntry(source));				
			});
					
			updateState({incidentList});
		}
	},
	renderer: {type: snabbdom},
	initialState: {
		incidentList: []
	},
	view,
	styles
});

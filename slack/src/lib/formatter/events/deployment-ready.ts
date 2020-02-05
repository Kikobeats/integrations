import { Components } from '@zeit/api-types';
import { ZeitClient } from '../../zeit-client';
import getEventUser from '../get-event-user';
import getUserAvatar from '../get-user-avatar';
import getUserDisplayName from '../get-user-display-name';
import getDeploymentContext from '../get-deployment-context';
import getDeploymentDasboardURL from '../get-deployment-dashboard-url';
import getProjectURL from '../get-project-url';

export default async function formatDeploymentReadyEvent(
	zeit: ZeitClient,
	event: Components.RequestBodies.DeploymentReadyEvent
) {
	const name = event.payload.name;
	const deployment = event.payload.deployment;
	const url = deployment ? deployment.url : event.payload.url;
	const user = await getEventUser(zeit, event.userId);
	const team = zeit.teamId ? await zeit.getTeam() : null;
	const avatar = getUserAvatar(user, deployment);
	const username = getUserDisplayName(user, deployment);
	const projectUrl = getProjectURL(name, user, team);
	const deployContext = getDeploymentContext(deployment);
	const deploymentDashboardURL = getDeploymentDasboardURL(deployment, user, team);

	return {
		attachments: [
			{
				author_name: `${username}${
					team ? ` from ${team.name} team` : ``
					}`,
				author_icon: avatar,
				text: `Deployment *<https://${url}|${url}>* \`READY\` :white_check_mark:`,
				fallback: `Deployment ${url} READY`,
				fields: [{
					value: `${name} • <${projectUrl}|Project> • <${deploymentDashboardURL}|Deployment Dashboard>`,
					short: true
				}],
				footer: deployContext,
				ts: (event.createdAt || Date.now()) / 1000,
				color: 'good'
			}
		]
	};
}

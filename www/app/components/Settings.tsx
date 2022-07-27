/// <reference path="../References.d.ts"/>
import * as React from 'react';
import * as SettingsTypes from '../types/SettingsTypes';
import SettingsStore from '../stores/SettingsStore';
import SubscriptionStore from '../stores/SubscriptionStore';
import * as SettingsActions from '../actions/SettingsActions';
import Page from './Page';
import PageHeader from './PageHeader';
import PagePanel from './PagePanel';
import PageSplit from './PageSplit';
import PageInput from './PageInput';
import PageSwitch from './PageSwitch';
import PageSelectButton from './PageSelectButton';
import PageSave from './PageSave';
import SettingsProvider from './SettingsProvider';
import SettingsSecondaryProvider from './SettingsSecondaryProvider';
import NonState from './NonState';

interface State {
	changed: boolean;
	disabled: boolean;
	message: string;
	provider: string;
	secondaryProvider: string;
	settings: SettingsTypes.Settings;
}

const css = {
	providers: {
		paddingBottom: '6px',
		marginBottom: '5px',
		borderBottomStyle: 'solid',
	} as React.CSSProperties,
	providersLabel: {
		margin: 0,
	} as React.CSSProperties,
	secondaryProviders: {
		paddingBottom: '6px',
		marginTop: '5px',
		marginBottom: '5px',
		borderBottomStyle: 'solid',
	} as React.CSSProperties,
};

export default class Settings extends React.Component<{}, State> {
	constructor(props: any, context: any) {
		super(props, context);
		this.state = {
			changed: false,
			disabled: false,
			message: '',
			provider: 'google',
			secondaryProvider: 'duo',
			settings: SettingsStore.settingsM,
		};
	}

	componentDidMount(): void {
		SettingsStore.addChangeListener(this.onChange);
		SettingsActions.sync();
	}

	componentWillUnmount(): void {
		SettingsStore.removeChangeListener(this.onChange);
	}

	onChange = (): void => {
		this.setState({
			...this.state,
			changed: false,
			settings: SettingsStore.settingsM,
		});
	}

	onSave = (): void => {
		this.setState({
			...this.state,
			disabled: true,
		});
		SettingsActions.commit(this.state.settings).then((): void => {
			this.setState({
				...this.state,
				message: 'Your changes have been saved',
				changed: false,
				disabled: false,
			});
		}).catch((): void => {
			this.setState({
				...this.state,
				message: '',
				disabled: false,
			});
		});
	}

	set = (name: string, val: any): void => {
		let settings: any = {
			...this.state.settings,
		};

		settings[name] = val;

		this.setState({
			...this.state,
			changed: true,
			message: '',
			settings: settings,
		});
	}

	render(): JSX.Element {
		let settings = this.state.settings;

		if (!settings) {
			return <div/>;
		}

		let subscriptionActive = SubscriptionStore.subscription ?
			SubscriptionStore.subscription.active : false;

		let providers: JSX.Element[] = [];
		for (let i = 0; i < settings.auth_providers.length; i++) {
			providers.push(<SettingsProvider
				key={i}
				provider={settings.auth_providers[i]}
				onChange={(state): void => {
					let prvdrs = [
						...this.state.settings.auth_providers,
					];
					prvdrs[i] = state;
					this.set('auth_providers', prvdrs);
				}}
				onRemove={(): void => {
					let prvdrs = [
						...this.state.settings.auth_providers,
					];
					prvdrs.splice(i, 1);
					this.set('auth_providers', prvdrs);
				}}
			/>);
		}

		let secondaryProviders: JSX.Element[] = [];
		for (let i = 0; i < settings.auth_secondary_providers.length; i++) {
			secondaryProviders.push(<SettingsSecondaryProvider
				key={i}
				provider={settings.auth_secondary_providers[i]}
				onChange={(state): void => {
					let prvdrs = [
						...this.state.settings.auth_secondary_providers,
					];
					prvdrs[i] = state;
					this.set('auth_secondary_providers', prvdrs);
				}}
				onRemove={(): void => {
					let prvdrs = [
						...this.state.settings.auth_secondary_providers,
					];
					prvdrs.splice(i, 1);
					this.set('auth_secondary_providers', prvdrs);
				}}
			/>);
		}

		return <Page>
			<PageHeader label="Settings"/>
			<PageSplit>
				<PagePanel hidden={subscriptionActive}>
					<NonState
						hidden={false}
						iconClass="bp3-icon-credit-card"
						title="Subscription Required"
						description="Subscription required for single sign-on."
					/>
				</PagePanel>
				<PagePanel hidden={!subscriptionActive}>
					<div className="bp3-border" style={css.providers}>
						<h5 style={css.providersLabel}>Authentication Providers</h5>
					</div>
					{providers}
					<PageSelectButton
						label="Add Provider"
						value={this.state.provider}
						buttonClass="bp3-intent-success"
						onChange={(val: string): void => {
							this.setState({
								...this.state,
								provider: val,
							});
						}}
						onSubmit={(): void => {
							let authProviders: SettingsTypes.Providers = [
								...settings.auth_providers,
								{
									type: this.state.provider,
									default_roles: [],
									auto_create: true,
									role_management: 'set_on_insert',
								},
							];
							this.set('auth_providers', authProviders);
						}}
					>
						<option value="authzero">Auth0</option>
						<option value="azure">Azure</option>
						<option value="google">Google</option>
						<option value="onelogin">OneLogin</option>
						<option value="okta">Okta</option>
						<option value="jumpcloud">JumpCloud</option>
					</PageSelectButton>
				</PagePanel>
				<PagePanel>
					<div className="bp3-border" style={css.secondaryProviders}>
						<h5 style={css.providersLabel}>Two-Factor Providers</h5>
					</div>
					{secondaryProviders}
					<PageSelectButton
						label="Add Secondary Provider"
						value={this.state.secondaryProvider}
						buttonClass="bp3-intent-success"
						onChange={(val: string): void => {
							this.setState({
								...this.state,
								secondaryProvider: val,
							});
						}}
						onSubmit={(): void => {
							let authProviders: SettingsTypes.SecondaryProviders = [
								...settings.auth_secondary_providers,
								{
									type: this.state.secondaryProvider,
								},
							];
							this.set('auth_secondary_providers', authProviders);
						}}
					>
						<option value="duo">Duo</option>
						<option value="one_login">OneLogin</option>
						<option value="okta">Okta</option>
					</PageSelectButton>
					<PageInput
						label="Admin Session Expire Minutes"
						help="Number of inactive minutes before a admin session expires"
						type="text"
						placeholder="Session expire"
						value={this.state.settings.auth_admin_expire}
						onChange={(val): void => {
							this.set('auth_admin_expire', parseInt(val, 10));
						}}
					/>
					<PageInput
						label="Admin Session Max Duration Minutes"
						help="Number of minutes from start of a admin session until expiration"
						type="text"
						placeholder="Session max duration"
						value={this.state.settings.auth_admin_max_duration}
						onChange={(val): void => {
							this.set('auth_admin_max_duration', parseInt(val, 10));
						}}
					/>
					<PageInput
						label="Service Session Expire Minutes"
						help="Number of inactive minutes before a service session expires"
						type="text"
						placeholder="Session expire"
						value={this.state.settings.auth_proxy_expire}
						onChange={(val): void => {
							this.set('auth_proxy_expire', parseInt(val, 10));
						}}
					/>
					<PageInput
						label="Service Session Max Duration Minutes"
						help="Number of minutes from start of a service session until expiration"
						type="text"
						placeholder="Session max duration"
						value={this.state.settings.auth_proxy_max_duration}
						onChange={(val): void => {
							this.set('auth_proxy_max_duration', parseInt(val, 10));
						}}
					/>
					<PageInput
						label="User Session Expire Minutes"
						help="Number of inactive minutes before a user session expires"
						type="text"
						placeholder="Session expire"
						value={this.state.settings.auth_user_expire}
						onChange={(val): void => {
							this.set('auth_user_expire', parseInt(val, 10));
						}}
					/>
					<PageInput
						label="User Session Max Duration Minutes"
						help="Number of minutes from start of a user session until expiration"
						type="text"
						placeholder="Session max duration"
						value={this.state.settings.auth_user_max_duration}
						onChange={(val): void => {
							this.set('auth_user_max_duration', parseInt(val, 10));
						}}
					/>
					<PageInput
						label="ElasticSearch Address"
						help="Address of ElasticSearch server, use comma separated list for multiple addresses."
						type="text"
						placeholder="ElasticSearch address"
						value={this.state.settings.elastic_address}
						onChange={(val): void => {
							this.set('elastic_address', val);
						}}
					/>
					<PageInput
						label="ElasticSearch Username"
						help="Username of ElasticSearch server"
						type="text"
						placeholder="ElasticSearch username"
						value={this.state.settings.elastic_username}
						onChange={(val): void => {
							this.set('elastic_username', val);
						}}
					/>
					<PageInput
						label="ElasticSearch Password"
						help="Password of ElasticSearch server"
						type="text"
						placeholder="ElasticSearch password"
						value={this.state.settings.elastic_password}
						onChange={(val): void => {
							this.set('elastic_password', val);
						}}
					/>
					<PageSwitch
						label="Elasticsearch log proxy requests"
						help="Send all user requests to the Elasticsearch server. The request header, URL query values and user information such as user ID, IP address and location will be included. If the request body contains form fields, json or xml this data will also be included."
						checked={this.state.settings.elastic_proxy_requests}
						onToggle={(): void => {
							this.set('elastic_proxy_requests',
								!this.state.settings.elastic_proxy_requests);
						}}
					/>
					<PageInput
						label="Log refresh interval in seconds"
						help="How often the web interface refresh the logs"
						type="text"
						placeholder="Session max duration"
						value={this.state.settings.logs_refresh_interval}
						onChange={(val): void => {
							this.set('logs_refresh_interval', parseInt(val, 10));
						}}
					/>
				</PagePanel>
			</PageSplit>
			<PageSave
				message={this.state.message}
				changed={this.state.changed}
				disabled={this.state.disabled}
				onCancel={(): void => {
					this.setState({
						...this.state,
						changed: false,
						message: 'Your changes have been discarded',
						settings: SettingsStore.settingsM,
					});
				}}
				onSave={this.onSave}
			/>
		</Page>;
	}
}

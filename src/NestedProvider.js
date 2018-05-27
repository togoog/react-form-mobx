import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import Context from './Context';
import withFormStore from './withFormStore';

@withFormStore()
@observer
export default class NestedProvider extends Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		formStore: PropTypes.object.isRequired,
		name: PropTypes.string.isRequired,
		isArray: PropTypes.bool,
	};

	static defaultProps = {
		isArray: false,
	};

	constructor(props) {
		super(props);

		const { name, formStore: parentStore, isArray } = props;
		const childStore = parentStore.attach(name, {
			onSubmit: parentStore.submit,
			isArray,
		});
		this.formStore = childStore;
	}

	componentWillUnmount() {
		this.props.formStore.detach(this.formStore.key);
	}

	render() {
		const { children } = this.props;
		return (
			<Context.Provider value={this.formStore}>{children}</Context.Provider>
		);
	}
}

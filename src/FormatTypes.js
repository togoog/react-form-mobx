import {
	isEmpty,
	isDate,
	isObject,
	isFunction,
	isString,
	padStart,
	padEnd,
} from './utils';

const ensureDate = (date) => {
	if (isDate(date)) return date;
	if (isObject(date)) {
		// for moment() like object
		if (isFunction(date.toDate)) return date.toDate();

		// for luxon.DateTime
		if (isFunction(date.toJSDate)) return date.toJSDate();
	}
	if (/^\d+$/.test(date)) return new Date(+padEnd(date, 13, '0'));
	return new Date(date);
};

const validNumber = (val) => {
	if (!/^-?\d+\.?\d*$/.test(val)) {
		throw new Error(`${val} is NOT a valid "number" type`);
	}
	return true;
};

const toNumber = (val) => validNumber(val) && (+val || 0);
const toInt = (val) => ~~toNumber(val);

const toStr = (val) => val.toString();
const toBoolean = (val) =>
	!!val &&
	val !== '0' &&
	val !== 'false' &&
	val !== 'undefined' &&
	val !== 'null';

const toDateTime = (val) => {
	// handle multi dateTime string by "," seperator
	if (isString(val) && ~val.indexOf(',')) {
		return val
			.split(',')
			.map(toDateTime)
			.join(',');
	}

	try {
		return `${toDate(val)}T${toTime(val)}`;
	}
	catch (err) {
		throw new Error(`Can NOT convert "${val}" to "dateTime" format`);
	}
};

const toDate = (val) => {
	// handle multi date string by "," seperator
	if (isString(val) && ~val.indexOf(',')) {
		return val
			.split(',')
			.map(toDate)
			.join(',');
	}

	try {
		const d = ensureDate(val);
		if (d.toString() === 'Invalid Date') throw new Error();
		const year = d.getFullYear();
		const month = padStart(d.getMonth() + 1, 2, 0);
		const date = padStart(d.getDate(), 2, 0);
		return `${year}-${month}-${date}`;
	}
	catch (err) {
		throw new Error(`Can NOT convert "${val}" to "date" format`);
	}
};

const toTime = (val) => {
	// handle multi time string by "," seperator
	if (isString(val) && ~val.indexOf(',')) {
		return val
			.split(',')
			.map(toTime)
			.join(',');
	}

	try {
		const d = ensureDate(val);
		if (d.toString() === 'Invalid Date') throw new Error();
		const hours = padStart(d.getHours(), 2, 0);
		const minutes = padStart(d.getMinutes(), 2, 0);
		const seconds = padStart(d.getSeconds(), 2, 0);
		const partialTime = `${hours}:${minutes}:${seconds}`;
		const zoneOffset = -d.getTimezoneOffset();

		/* istanbul ignore next */
		const offsetDif = zoneOffset < 0 ? '-' : '+';

		const offsetZoneHours = padStart(Math.abs(zoneOffset / 60), 2, 0);
		const offsetZoneMinutes = padStart(Math.abs(zoneOffset % 60), 2, 0);
		const offset = `${offsetDif}${offsetZoneHours}:${offsetZoneMinutes}`;
		return partialTime + offset;
	}
	catch (err) {
		throw new Error(`Can NOT convert "${val}" to "time" format`);
	}
};

export const formatHelper = {
	integer: toInt,
	number: toNumber,
	string: toStr,
	boolean: toBoolean,
	date: toDate,
	time: toTime,
	dateTime: toDateTime,
};

export const FormatTypesKeys = Object.keys(formatHelper);

// TODO: add cache
export function createFormatFunc(type) {
	return function format(val) {
		if (isEmpty(val)) return val;
		return formatHelper[type](val);
	};
}

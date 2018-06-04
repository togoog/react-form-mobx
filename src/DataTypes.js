import {
	isEmpty,
	isDate,
	isString,
	isNumber,
	isArray,
	padStart,
	padEnd,
} from './utils';

const tsToDate = (n) => new Date(+padEnd(n, 13, '0')).toISOString();

const validNumber = (val) => {
	if (!/^-?\d+\.?\d*$/.test(val)) {
		throw new Error(`${val} is NOT a valid "number" type`);
	}
	return true;
};

const toInt = (val) => validNumber(val) && (parseInt(val, 10) || 0);
const toNumber = (val) => validNumber(val) && (+val || 0);

const toStr = (val) => val.toString();
const toBoolean = (val) =>
	!!val &&
	val !== '0' &&
	val !== 'false' &&
	val !== 'undefined' &&
	val !== 'null';

const toDateTime = (val) => {
	// handle multi dateTime string by "," seperator
	if (isString(val) && val.includes(',')) {
		return val.split(',').map(toDateTime);
	}
	if (isArray(val)) {
		return val.map(toDateTime);
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
	if (isString(val) && val.includes(',')) {
		return val.split(',').map(toDate);
	}
	if (isArray(val)) {
		return val.map(toDate);
	}

	try {
		const d = isDate(val) ? val : new Date(val);
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
	if (isString(val) && val.includes(',')) {
		return val.split(',').map(toTime);
	}
	if (isArray(val)) {
		return val.map(toTime);
	}

	try {
		const d = isDate(val) ? val : new Date(val);
		if (d.toString() === 'Invalid Date') throw new Error();
		const hours = padStart(d.getHours(), 2, 0);
		const minutes = padStart(d.getMinutes(), 2, 0);
		const seconds = padStart(d.getSeconds(), 2, 0);
		const milliseconds = padStart(d.getMilliseconds(), 3, 0);
		const partialTime = `${hours}:${minutes}:${seconds}.${milliseconds}`;
		const zoneOffset = -d.getTimezoneOffset();
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

const DataTypes = {
	integer: toInt,
	number: toNumber,
	string: toStr,
	boolean: toBoolean,
	date: toDate,
	time: toTime,
	dateTime: toDateTime,
};

export const DataTypeKeys = Object.keys(DataTypes);

// TODO: add cache
export function createFormatDataTypeFunc(type) {
	return function formatDataType(val) {
		if (isEmpty(val)) return val;
		return DataTypes[type](val);
	};
}

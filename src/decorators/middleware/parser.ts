function IntegerParser(data: any) {
	return Number(data);
}

function StringParser(data: any) {
	return String(data);
}

function BooleanParser(data: any) {
	return Boolean(data);
}

function DateParser(data: any) {
	return new Date(data);
}

function ArrayParser(data: any) {
	return data.split(",");
}

function FloatParser(data: any) {
	return Number(data);
}

export { ArrayParser, BooleanParser, DateParser, FloatParser, IntegerParser, StringParser };

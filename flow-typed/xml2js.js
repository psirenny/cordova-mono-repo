// @flow

type Object = { [string]: number };

interface ToStringable {
  toString(): string;
};

declare module 'xml2js' {
  declare module.exports: {
    parseString: (
      xmlString: ToStringable,
      callback: (error: ?Error, result: Object) => void,
    ) => void,
  };
}

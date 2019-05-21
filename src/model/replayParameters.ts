export interface ReplayParameters {
	startDate?: Date;

	//QualificationParameters
	socialName: string;
	id: string;
	contactName: string;
	contactEmail: string;
	contactPhone: string;

	//SmartClientParameters
	smartClientFilename: string;
	parameters: string[];
	startProgram: string;
	programParameters: string[];
	driver: string;
	environment: string;

	//RecordParameters
	parametersFilename: string;
	alias: string;
	description: string;
	recordFilename: string;
	includes: string[];
	excludes: string[];
	tables: string[];
	startImmediately: boolean;
	
	//AdvancedParameters {
	functions: string[];
	arrayLevel: number;
	recordAllLevels: boolean;
	disableDuplicateLineVerification: boolean;
}
import { DataSource } from 'typeorm';
import { config } from '../common/config';

const AppDataSource = new DataSource(config.getDatabaseOptions());
export default AppDataSource;

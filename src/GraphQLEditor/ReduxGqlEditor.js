import { connect } from 'react-redux';
import GqlEditor from './GqlEditor';

/** @param {{ graphiql: import('./types').GraphiqlState }} state */
const mapStateToProps = (state) => ({
  schema: state.graphiql.schema,
  guppySchema: state.graphiql.guppySchema,
});

const ReduxGqlEditor = connect(mapStateToProps)(GqlEditor);
export default ReduxGqlEditor;

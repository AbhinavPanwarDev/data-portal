import PropTypes from 'prop-types';

export const GuppyConfigType = PropTypes.shape({
  dataType: PropTypes.string.isRequired,
  fieldMapping: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string,
      name: PropTypes.string,
    })
  ),
  manifestMapping: PropTypes.shape({
    resourceIndexType: PropTypes.string,
    resourceIdField: PropTypes.string,
    referenceIdFieldInResourceIndex: PropTypes.string,
    referenceIdFieldInDataIndex: PropTypes.string,
  }),
});

export const FilterConfigType = PropTypes.shape({
  anchor: PropTypes.shape({
    field: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string),
    tabs: PropTypes.arrayOf(PropTypes.string),
  }),
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      fields: PropTypes.arrayOf(PropTypes.string),
    })
  ),
});

export const TableConfigType = PropTypes.shape({
  enabled: PropTypes.bool,
  fields: PropTypes.arrayOf(PropTypes.string),
  ordered: PropTypes.bool,
});

export const ButtonConfigType = PropTypes.shape({
  buttons: PropTypes.arrayOf(
    PropTypes.exact({
      enabled: PropTypes.bool.isRequired,
      type: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      leftIcon: PropTypes.string,
      rightIcon: PropTypes.string,
      fileName: PropTypes.string,
      dropdownId: PropTypes.string,
      tooltipText: PropTypes.string,
    })
  ),
  dropdowns: PropTypes.objectOf(PropTypes.string),
  terraExportURL: PropTypes.string,
  terraTemplate: PropTypes.arrayOf(PropTypes.string),
  sevenBridgesExportURL: PropTypes.string,
});

export const ChartConfigType = PropTypes.object;

export const SurvivalAnalysisConfigType = PropTypes.shape({
  result: PropTypes.shape({
    risktable: PropTypes.bool,
    survival: PropTypes.bool,
  }),
});

export const PatientIdsConfigType = PropTypes.shape({
  filter: PropTypes.bool,
  export: PropTypes.bool,
});

/**
 * WordPress dependencies
 */
import { __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { CSS_UNITS, parseUnit } from './border';
import { cleanEmptyObject } from './utils';

const MIN_BORDER_WIDTH = 0;

/**
 * Inspector control for configuring border width property.
 *
 * @param  {Object} props  Block properties.
 * @return {WPElement}     Border width edit element.
 */
export const BorderWidthEdit = ( props ) => {
	const {
		attributes: { borderColor, style },
		setAttributes,
	} = props;

	const { width, color: customBorderColor, style: borderStyle } =
		style?.border || {};

	// Step value is maintained in state so step is appropriate for current unit
	// even when current radius value is undefined.
	const initialStep = parseUnit( width ) === 'px' ? 1 : 0.25;
	const [ step, setStep ] = useState( initialStep );
	const [ styleSelection, setStyleSelection ] = useState();
	const [ colorSelection, setColorSelection ] = useState();

	// Temporarily track previous border color & style selections to be able to
	// restore them when border width changes from zero value.
	useEffect( () => {
		if ( borderStyle !== 'none' ) {
			setStyleSelection( borderStyle );
		}
	}, [ borderStyle ] );

	useEffect( () => {
		if ( borderColor || customBorderColor ) {
			setColorSelection( {
				name: !! borderColor ? borderColor : undefined,
				color: !! customBorderColor ? customBorderColor : undefined,
			} );
		}
	}, [ borderColor, customBorderColor ] );

	const onUnitChange = ( newUnit ) => {
		setStep( newUnit === 'px' ? 1 : 0.25 );
	};

	const onChange = ( newWidth ) => {
		let newStyle = {
			...style,
			border: {
				...style?.border,
				width: newWidth,
			},
		};

		// Used to clear named border color attribute.
		let borderPaletteColor = borderColor;

		const hasZeroWidth = parseFloat( newWidth ) === 0;

		// Setting the border width explicitly to zero will also set the
		// border style to `none` and clear border color attributes.
		if ( hasZeroWidth ) {
			borderPaletteColor = undefined;
			newStyle.border.color = undefined;
			newStyle.border.style = 'none';
		}

		// Restore previous border style selection if width is now not zero and
		// border style was 'none'. This is to support changes to the UI which
		// change the border style UI to a segmented control without a "none"
		// option.
		if ( ! hasZeroWidth && borderStyle === 'none' ) {
			newStyle.border.style = styleSelection;
		}

		// Restore previous border color selection if width is no longer zero
		// and current border color is undefined.
		if ( ! hasZeroWidth && borderColor === undefined ) {
			borderPaletteColor = colorSelection?.name;
			newStyle.border.color = colorSelection?.color;
		}

		// If width was reset, clean out undefined styles.
		if ( newWidth === undefined || newWidth === '' ) {
			newStyle = cleanEmptyObject( newStyle );
		}

		setAttributes( {
			borderColor: borderPaletteColor,
			style: newStyle,
		} );
	};

	return (
		<UnitControl
			value={ width }
			label={ __( 'Border width' ) }
			min={ MIN_BORDER_WIDTH }
			onChange={ onChange }
			onUnitChange={ onUnitChange }
			step={ step }
			units={ CSS_UNITS }
		/>
	);
};

/**
 * External dependencies
 */
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import a11yPlugin from 'colord/plugins/a11y';

/**
 * WordPress dependencies
 */
import { speak } from '@wordpress/a11y';
import { __ } from '@wordpress/i18n';
import { Notice } from '@wordpress/components';
import { useEffect } from '@wordpress/element';

extend( [ namesPlugin, a11yPlugin ] );

function ContrastCheckerMessage( {
	colordBackgroundColor,
	colordTextColor,
	colordLinkColor,
	backgroundColor,
	textColor,
	linkColor,
} ) {
	const backgroundColorBrightness = colordBackgroundColor.brightness();
	const msg =
		backgroundColorBrightness < colordTextColor.brightness() ||
		backgroundColorBrightness < colordLinkColor.brightness()
			? __(
					'This color combination may be hard for people to read. Try using a darker background color and/or a brighter text color.'
			  )
			: __(
					'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.'
			  );

	// Note: The `Notice` component can speak messages via its `spokenMessage`
	// prop, but the contrast checker requires granular control over when the
	// announcements are made. Notably, the message will be re-announced if a
	// new color combination is selected and the contrast is still insufficient.
	useEffect( () => {
		speak( __( 'This color combination may be hard for people to read.' ) );
	}, [ backgroundColor, textColor, linkColor ] );

	return (
		<div className="block-editor-contrast-checker">
			<Notice
				spokenMessage={ null }
				status="warning"
				isDismissible={ false }
			>
				{ msg }
			</Notice>
		</div>
	);
}

function ContrastChecker( {
	backgroundColor,
	fallbackBackgroundColor,
	fallbackTextColor,
	fallbackLinkColor,
	fontSize, // font size value in pixels
	isLargeText,
	textColor,
	linkColor,
} ) {
	// @TODO Should background color or one of textColor or linkColor be required?
	// @TODO Or should textColor be required and linkColor optional?
	if (
		! ( backgroundColor || fallbackBackgroundColor ) ||
		! ( textColor || fallbackTextColor )
	) {
		return null;
	}

	const colordBackgroundColor = colord(
		backgroundColor || fallbackBackgroundColor
	);

	// @TODO we should have some logic that checks whether textColor or linkColor or both exist.
	// @TODO If one or the other or both exist then the contrast checking logic needs to reflect it.
	const colordTextColor = colord( textColor || fallbackTextColor );
	const colordLinkColor = colord( linkColor || fallbackLinkColor );
	const hasTransparency =
		colordBackgroundColor.alpha() !== 1 ||
		colordTextColor.alpha() !== 1 ||
		colordLinkColor.alpha() !== 1;
	const textSize =
		isLargeText || ( isLargeText !== false && fontSize >= 24 )
			? 'large'
			: 'small';
	const isTextColorReadable = colordTextColor.isReadable(
		colordBackgroundColor,
		{
			level: 'AA',
			size: textSize,
		}
	);

	const isLinkColorReadable = colordLinkColor.isReadable(
		colordBackgroundColor,
		{
			level: 'AA',
			size: textSize,
		}
	);

	if ( hasTransparency || ( isTextColorReadable && isLinkColorReadable ) ) {
		return null;
	}

	return (
		<ContrastCheckerMessage
			backgroundColor={ backgroundColor }
			textColor={ textColor }
			linkColor={ linkColor }
			colordBackgroundColor={ colordBackgroundColor }
			colordTextColor={ colordTextColor }
			colordLinkColor={ colordLinkColor }
		/>
	);
}

export default ContrastChecker;

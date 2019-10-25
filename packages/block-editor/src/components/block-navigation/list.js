/**
 * External dependencies
 */
import { map } from 'lodash';
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { Button } from '@wordpress/components';
import { getBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { create, getTextContent } from '@wordpress/rich-text';

/**
 * Internal dependencies
 */
import BlockIcon from '../block-icon';
import BlockMover from '../block-mover';

/**
 * Get the block display name, if it has one, or the block title if it doesn't.
 *
 * @param {Object} blockType  The block type.
 * @param {Object} attributes The values of the block's attributes
 *
 * @return {string} The display name value.
 */
function getBlockDisplayName( blockType, attributes ) {
	const displayNameAttribute = blockType.__experimentalDisplayName;

	if ( ! displayNameAttribute || ! attributes[ displayNameAttribute ] ) {
		return blockType.title;
	}

	// Strip any formatting.
	const richTextValue = create( { html: attributes[ displayNameAttribute ] } );
	const formatlessDisplayName = getTextContent( richTextValue );

	return formatlessDisplayName;
}

export default function BlockNavigationList( {
	blocks,
	selectedBlockClientId,
	selectBlock,
	showNestedBlocks,
	showMovers,
	isRootItem = true,
} ) {
	const hasMovers = showMovers && blocks.length > 1;

	return (
		/*
		 * Disable reason: The `list` ARIA role is redundant but
		 * Safari+VoiceOver won't announce the list otherwise.
		 */
		/* eslint-disable jsx-a11y/no-redundant-roles */
		<ul className="editor-block-navigation__list block-editor-block-navigation__list" role={ isRootItem ? 'tree' : 'group' }>
			{ map( blocks, ( block ) => {
				const blockType = getBlockType( block.name );
				const isSelected = block.clientId === selectedBlockClientId;
				const blockDisplayName = getBlockDisplayName( blockType, block.attributes );

				return (
					<li key={ block.clientId } role="treeitem">
						<div
							className={ classnames( 'editor-block-navigation__item block-editor-block-navigation__item', {
								'is-selected': isSelected,
							} ) }
						>
							<Button
								className="editor-block-navigation__item-button block-editor-block-navigation__item-button"
								onClick={ () => selectBlock( block.clientId ) }
							>
								<BlockIcon icon={ blockType.icon } showColors />
								{ blockDisplayName }
								{ isSelected && <span className="screen-reader-text">{ __( '(selected block)' ) }</span> }
							</Button>
							{ hasMovers && ( <BlockMover clientIds={ [ block.clientId ] } /> ) }
						</div>
						{ showNestedBlocks && !! block.innerBlocks && !! block.innerBlocks.length && (
							<BlockNavigationList
								blocks={ block.innerBlocks }
								selectedBlockClientId={ selectedBlockClientId }
								selectBlock={ selectBlock }
								showMovers={ showMovers }
								showNestedBlocks
								isRootItem={ false }
							/>
						) }
					</li>
				);
			} ) }
		</ul>
		/* eslint-enable jsx-a11y/no-redundant-roles */
	);
}

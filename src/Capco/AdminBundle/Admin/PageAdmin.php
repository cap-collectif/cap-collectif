<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Filter\KnpTranslationFieldFilter;
use Capco\AppBundle\Form\Type\PurifiedTextType;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class PageAdmin extends AbstractAdmin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            // We can no more use `null` here because sonata
            // can not guess type on translation entity
            // but it's propably better like that :-)
            ->add('title', TextType::class, [
                'label' => 'admin.fields.page.title',
            ])
            ->add('slug', TextType::class, [
                'label' => 'admin.fields.page.slug',
            ])
            ->add('body', CKEditorType::class, [
                'label' => 'admin.fields.page.body',
                'config_name' => 'admin_editor',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.page.is_enabled',
                'required' => false,
            ])
            ->end();
        $formMapper
            ->with('admin.fields.page.advanced')
            ->add('metaDescription', PurifiedTextType::class, [
                'label' => 'page.metadescription',
                'required' => false,
                'help' => 'admin.help.metadescription',
                'strip_tags' => true,
                'purify_html' => true,
                'purify_html_profile' => 'default',
            ])
            ->add(
                'cover',
                'sonata_type_model_list',
                [
                    'required' => false,
                    'label' => 'admin.fields.project.cover',
                    'help' => 'admin.help.social_network_thumbnail',
                ],
                [
                    'link_parameters' => [
                        'context' => 'default',
                        'hide_context' => true,
                        'provider' => 'sonata.media.provider.image',
                    ],
                ]
            )
            ->add('customCode', TextareaType::class, [
                'label' => 'admin.customcode',
                'required' => false,
                'help' => 'admin.help.customcode',
                'attr' => [
                    'rows' => 10,
                    'placeholder' => '<script type="text/javascript"> </script>',
                ],
            ])
            ->end();
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', KnpTranslationFieldFilter::class, [
                'label' => 'admin.fields.page.title',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.page.is_enabled',
            ])
            ->add('MenuItems', null, [
                'label' => 'admin.fields.page.menu_items',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.page.updated_at',
            ]);
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.page.title',
            ])
            ->add('slug', null, [
                'label' => 'admin.fields.page.slug',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.page.is_enabled',
            ])
            ->add('MenuItems', null, [
                'label' => 'admin.fields.page.menu_items',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.page.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'edit' => [],
                    'delete' => [],
                ],
            ]);
    }
}

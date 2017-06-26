<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;

class ProposalFormAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    protected $formOptions = [
        'cascade_validation' => true,
    ];

    // Fields to be shown on create/edit forms
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.proposal_form.group_general')
            ->add('title', null, [
                'label' => 'admin.fields.proposal_form.name',
            ])
            ->end()
            ->with('admin.fields.proposal_form.group_form')
            ->add('description', CKEditorType::class, [
                'label' => 'admin.fields.proposal_form.introduction',
                'config_name' => 'admin_editor',
                'required' => false,
            ])
            ->add('usingText', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.title',
                'required' => false,
                'mapped' => false,
                'disabled' => true,
                'read_only' => true,
                'attr' => ['style' => 'padding-top: 25px', 'checked' => true],
            ])
            ->add('textMandatory', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.mandatory',
                'required' => false,
                'attr' => ['checked' => true],
                'mapped' => false,
                'disabled' => true,
                'read_only' => true,
            ])
            ->add('titleHelpText', TextType::class, [
                'label' => 'admin.fields.proposal_form.help_text',
                'required' => false,
            ]);

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper
                ->add('usingThemes', CheckboxType::class, [
                    'label' => 'admin.fields.proposal_form.using_themes',
                    'required' => false,
                    'attr' => ['style' => 'padding-top: 25px'],
                ])
                ->add('themeMandatory', CheckboxType::class, [
                    'label' => 'admin.fields.proposal_form.mandatory',
                    'required' => false,
                ])
                ->add('themeHelpText', TextType::class, [
                    'label' => 'admin.fields.proposal_form.help_text',
                    'required' => false,
                ])
            ;
        }

        $formMapper
            ->add('usingCategories', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.using_categories',
                'required' => false,
                'attr' => ['style' => 'padding-top: 25px'],
            ])
            ->add('categoryMandatory', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.mandatory',
                'required' => false,
            ])
            ->add('categoryHelpText', TextType::class, [
                'label' => 'admin.fields.proposal_form.help_text',
                'required' => false,
            ])
            ->add('categories', 'sonata_type_collection', [
                'label' => 'admin.fields.proposal_form.categories',
                'by_reference' => false,
                'required' => false,
            ], [
                'edit' => 'inline',
                'inline' => 'table',
            ]);

        $formMapper->add('usingAddress', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.using_address',
                'required' => false,
                'attr' => ['style' => 'padding-top: 25px'],
            ])
            ->add('addressMandatory', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.mandatory',
                'required' => false,
                'attr' => ['checked' => true],
                'mapped' => false,
                'disabled' => true,
                'read_only' => true,
            ])
            ->add('addressHelpText', TextType::class, [
                'label' => 'admin.fields.proposal_form.help_text',
                'required' => false,
            ])
            ->add('latMap', TextType::class, [
                'label' => 'admin.fields.proposal_form.latitude',
                'required' => false,
                'help' => 'admin.fields.proposal_form.map_help',
            ])
            ->add('lngMap', TextType::class, [
                'label' => 'admin.fields.proposal_form.longitude',
                'required' => false,
                'help' => 'admin.fields.proposal_form.map_help',
            ])
            ->add('zoomMap', NumberType::class, [
                'label' => 'admin.fields.proposal_form.zoom',
                'required' => false,
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('districts')) {
            $formMapper->add('usingDistrict', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.using_district',
                'required' => false,
                'attr' => ['style' => 'padding-top: 25px'],
            ])
                ->add('districtMandatory', CheckboxType::class, [
                    'label' => 'admin.fields.proposal_form.mandatory',
                    'required' => false,
                ])
                ->add('districtHelpText', TextType::class, [
                    'label' => 'admin.fields.proposal_form.help_text',
                    'required' => false,
                ]);
        }

        $formMapper->add('usingDescription', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.description',
                'required' => false,
                'mapped' => false,
                'disabled' => true,
                'read_only' => true,
                'attr' => ['style' => 'padding-top: 25px', 'checked' => true],
            ])
            ->add('textDescription', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.mandatory',
                'required' => false,
                'attr' => ['checked' => true],
                'mapped' => false,
                'disabled' => true,
                'read_only' => true,
            ])
            ->add('descriptionHelpText', TextType::class, [
                'label' => 'admin.fields.proposal_form.help_text',
                'required' => false,
            ]);

        $formMapper
                ->add('usingIllustration', CheckboxType::class, [
                    'label' => 'admin.fields.proposal_form.illustration',
                    'required' => false,
                    'mapped' => false,
                    'disabled' => true,
                    'read_only' => true,
                    'attr' => ['style' => 'padding-top: 25px; padding-bottom: 25px', 'checked' => true],
                ])
                ->add('questions', 'sonata_type_collection', [
                'label' => 'admin.fields.proposal_form.questions',
                'by_reference' => false,
                'required' => false,
            ], [
                'edit' => 'inline',
                'inline' => 'table',
                'sortable' => 'position',
            ]);

        $formMapper->end();

        $formMapper->with('admin.fields.proposal_form.notifications')
            ->add('notificationsConfiguration', 'sonata_type_admin', [
                'label' => 'admin.fields.proposal_form.notification.help',
                'required' => false,
            ])
            ->end();
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [],
                    'edit' => [],
                    'delete' => [],
                ],
            ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.proposal_form.enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.proposal_form.updated_at',
            ])
        ;
    }
}

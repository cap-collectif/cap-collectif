<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Sonata\AdminBundle\Show\ShowMapper;

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
                'label' => 'admin.fields.proposal_form.title',
            ])
            ->add('description', CKEditorType::class, [
                'label' => 'admin.fields.proposal_form.description',
                'config_name' => 'admin_editor',
                'required' => false,
            ])
            ->add('usingDistrict', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.using_district',
                'required' => false,
            ])
            ->add('districtMandatory', CheckboxType::class, [
                'label' => 'admin.fields.proposal_form.district_mandatory',
                'required' => false,
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper
                ->add('usingThemes', null, [
                    'label' => 'admin.fields.proposal_form.using_themes',
                    'required' => false,
                ])
                ->add('themeMandatory', null, [
                    'label' => 'admin.fields.proposal_form.theme_mandatory',
                    'required' => false,
                ])
            ;
        }

        $formMapper
            ->add('usingCategories', null, [
                'label' => 'admin.fields.proposal_form.using_categories',
                'required' => false,
            ])
            ->add('categoryMandatory', null, [
                'label' => 'admin.fields.proposal_form.category_mandatory',
                'required' => false,
            ])
            ->end()

            ->with('admin.fields.proposal_form.group_categories', ['class' => 'col-md-12 categories-hideable'])
            ->add('categories', 'sonata_type_collection', [
                'label' => 'admin.fields.proposal_form.categories',
                'by_reference' => false,
                'required' => false,
            ], [
                'edit' => 'inline',
                'inline' => 'table',
            ])
            ->end()

            ->with('admin.fields.proposal_form.group_help_texts')
            ->add('titleHelpText', null, [
                'label' => 'admin.fields.proposal_form.title_help_text',
                'required' => false,
                'help' => 'admin.fields.proposal_form.help_text_title_help_text',
            ])
            ->add('descriptionHelpText', null, [
                'label' => 'admin.fields.proposal_form.description_help_text',
                'required' => false,
                'help' => 'admin.fields.proposal_form.help_text_description_help_text',
            ])
        ;

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('districts')) {
            $formMapper
                ->add('districtHelpText', null, [
                    'label' => 'admin.fields.proposal_form.district_help_text',
                    'required' => false,
                    'help' => 'admin.fields.proposal_form.help_text_district_help_text',
                ])
            ;
        }

        if ($this->getConfigurationPool()->getContainer()->get('capco.toggle.manager')->isActive('themes')) {
            $formMapper
                ->add('themeHelpText', null, [
                    'label' => 'admin.fields.proposal_form.theme_help_text',
                    'required' => false,
                ])
            ;
        }

        $formMapper
            ->add('categoryHelpText', null, [
                'label' => 'admin.fields.proposal_form.category_help_text',
                'required' => false,
            ])
            ->end();

        $formMapper->with('admin.fields.proposal_form.notifications')
            ->add('notificationsConfiguration', 'sonata_type_admin', [
                'label' => 'admin.fields.proposal_form.notification.help',
                'required' => false,
            ])
            ->end();

        $formMapper->with('admin.fields.proposal_form.group_questions')
            ->add('questions', 'sonata_type_collection', [
                'label' => 'admin.fields.proposal_form.questions',
                'by_reference' => false,
                'required' => false,
            ], [
                'edit' => 'inline',
                'inline' => 'table',
                'sortable' => 'position',
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

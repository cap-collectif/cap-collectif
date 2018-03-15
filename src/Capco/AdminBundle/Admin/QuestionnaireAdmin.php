<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class QuestionnaireAdmin extends Admin
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
            ->with('admin.fields.questionnaire.group_general')
                ->add('title', null, [
                    'label' => 'admin.fields.questionnaire.title',
                ])
                ->add('description', CKEditorType::class, [
                    'label' => 'admin.fields.questionnaire.description',
                    'config_name' => 'admin_editor',
                    'required' => false,
                ])
            ->end()
        ;

        $formMapper
            ->with('admin.fields.questionnaire.group_questions')
                ->add('questions', 'sonata_type_collection', [
                    'label' => 'admin.fields.questionnaire.questions',
                    'by_reference' => false,
                    'required' => false,
                ], [
                    'edit' => 'inline',
                    'inline' => 'table',
                    'sortable' => 'position',
                ])
            ->end()
        ;

        $formMapper
            ->with('admin.fields.questionnaire.group_options')
                ->add('multipleRepliesAllowed', null, [
                    'label' => 'admin.fields.questionnaire.multiple_replies_allowed',
                    'required' => false,
                ])
                ->add('anonymousAllowed', null, [
                    'label' => 'admin.fields.questionnaire.anonymous_allowed',
                    'required' => false,
                ])
                ->add('acknowledgeReplies', null, [
                    'label' => 'admin.fields.questionnaire.acknowledge_replies',
                    'required' => false,
                ])
            ->end()
        ;
    }

    // Fields to be shown on filter forms
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.questionnaire.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
            ])
        ;
    }

    // Fields to be shown on lists
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.questionnaire.title',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
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
                'label' => 'admin.fields.questionnaire.title',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.questionnaire.enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.questionnaire.updated_at',
            ])
        ;
    }
}

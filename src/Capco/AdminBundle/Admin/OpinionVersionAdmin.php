<?php

namespace Capco\AdminBundle\Admin;

use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class OpinionVersionAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'ASC',
        '_sort_by' => 'title',
    ];

    public function getBatchActions()
    {
    }

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, [
                'label' => 'admin.fields.opinion_version.title',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.opinion_version.body',
            ])
            ->add('comment', null, [
                'label' => 'admin.fields.opinion_version.comment',
            ])
            ->add('author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.opinion_version.author',
            ], null, [
                'property' => 'username',
            ])
            ->add('parent', null, [
                'label' => 'admin.fields.opinion_version.parent',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.opinion_version.is_enabled',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.opinion_version.is_trashed',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion_version.updated_at',
            ])
            ->add('expired', null, ['label' => 'admin.global.expired'])
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, [
                'label' => 'admin.fields.opinion_version.title',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.opinion_version.body',
            ])
            ->add('comment', null, [
                'label' => 'admin.fields.opinion_version.comment',
            ])
            ->add('author', null, [
                'label' => 'admin.fields.opinion_version.author',
            ])
            ->add('parent', null, [
                'label' => 'admin.fields.opinion_version.parent',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.opinion_version.is_enabled',
                'editable' => true,
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.opinion_version.is_trashed',
                'editable' => true,
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion_version.updated_at',
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
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();
        $formMapper
            ->with('admin.fields.opinion_version.group_content', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.opinion_version.group_publication', ['class' => 'col-md-12'])->end()
            ->with('admin.fields.opinion_version.group_answer', ['class' => 'col-md-12'])->end()
            ->end()
        ;

        $formMapper
            // Content
            ->with('admin.fields.opinion_version.group_content')
                ->add('title', null, [
                    'label' => 'admin.fields.opinion_version.title',
                ])
                ->add('author', 'sonata_type_model_autocomplete', [
                    'label' => 'admin.fields.opinion_version.author',
                    'property' => 'username',
                ])
                ->add('parent', 'sonata_type_model', [
                    'label' => 'admin.fields.opinion_version.parent',
                ])
                ->add('body', CKEditorType::class, [
                    'label' => 'admin.fields.opinion_version.body',
                    'config_name' => 'admin_editor',
                ])
                ->add('comment', CKEditorType::class, [
                    'label' => 'admin.fields.opinion_version.comment',
                    'config_name' => 'admin_editor',
                ])
            ->end()

            // Publication
            ->with('admin.fields.opinion_version.group_publication')
                ->add('enabled', null, [
                    'label' => 'admin.fields.opinion_version.is_enabled',
                    'required' => false,
                ])
                ->add('expired', null, [
                    'label' => 'admin.global.expired',
                    'attr' => [
                      'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                      'readonly' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                    ],
                ])
                ->add('isTrashed', null, [
                    'label' => 'admin.fields.opinion_version.is_trashed',
                    'required' => false,
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.opinion_version.trashed_reason',
                ])
            ->end()

            // Answer
            ->with('admin.fields.opinion_version.group_answer')
            ->add('answer', 'sonata_type_model_list', [
                'label' => 'admin.fields.opinion_version.answer',
                'btn_list' => false,
                'required' => false,
            ])
            ->end()
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('title', null, [
                'label' => 'admin.fields.opinion_version.title',
            ])
            ->add('author', null, [
                'label' => 'admin.fields.opinion_version.author',
            ])
            ->add('parent', null, [
                'label' => 'admin.fields.opinion_version.parent',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.opinion_version.body',
            ])
            ->add('comment', null, [
                'label' => 'admin.fields.opinion_version.comment',
            ])
            ->add('votesCountOk', null, [
                'label' => 'admin.fields.opinion_version.vote_count_ok',
            ])
            ->add('votesCountNok', null, [
                'label' => 'admin.fields.opinion_version.vote_count_nok',
            ])
            ->add('votesCountMitige', null, [
                'label' => 'admin.fields.opinion_version.vote_count_mitige',
            ])
            ->add('argumentsCount', null, [
                'label' => 'admin.fields.opinion_version.argument_count',
            ])
            ->add('sourcesCount', null, [
                'label' => 'admin.fields.opinion_version.source_count',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.opinion_version.is_enabled',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.opinion_version.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.opinion_version.updated_at',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.opinion_version.is_trashed',
            ])
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, [
                    'label' => 'admin.fields.opinion_version.trashed_at',
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.opinion_version.trashed_reason',
                ])
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'show', 'create', 'edit', 'delete']);
    }
}

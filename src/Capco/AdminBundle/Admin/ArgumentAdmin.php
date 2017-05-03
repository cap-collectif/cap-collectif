<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Entity\Argument;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class ArgumentAdmin extends Admin
{
    protected $datagridValues = [
        '_sort_order' => 'DESC',
        '_sort_by' => 'updatedAt',
    ];

    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('type', null, [
                'label' => 'admin.fields.argument.type',
            ])
            ->add('opinion', null, [
                'label' => 'admin.fields.argument.opinion',
            ])
            ->add('Author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.argument.author',
            ], null, [
                'property' => 'username',
            ])
            ->add('votesCount', null, [
                'label' => 'admin.fields.argument.vote_count',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.argument.updated_at',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.argument.is_enabled',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.argument.is_trashed',
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
            ->addIdentifier('body', null, [
                'label' => 'admin.fields.argument.body',
                'template' => 'CapcoAdminBundle:Argument:body_list_field.html.twig',
            ])
            ->add('type', null, [
                'label' => 'admin.fields.argument.type',
                'template' => 'CapcoAdminBundle:Argument:type_list_field.html.twig',
                'typesLabels' => Argument::$argumentTypesLabels,
            ])
            ->add('opinion', 'sonata_type_model', [
                'label' => 'admin.fields.argument.opinion',
            ])
            ->add('Author', 'sonata_type_model', [
                'label' => 'admin.fields.argument.author',
            ])
            ->add('votesCount', null, [
                'label' => 'admin.fields.argument.vote_count',
            ])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.argument.is_enabled',
            ])
            ->add('isTrashed', null, [
                'editable' => true,
                'label' => 'admin.fields.argument.is_trashed',
            ])
            ->add('updatedAt', 'datetime', [
                'label' => 'admin.fields.argument.updated_at',
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
            ->add('type', 'choice', [
                'label' => 'admin.fields.argument.type',
                'choices' => Argument::$argumentTypesLabels,
                'translation_domain' => 'CapcoAppBundle',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.argument.is_enabled',
                'required' => false,
            ])
            ->add('opinion', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.argument.opinion',
                'property' => 'title',
            ])
            ->add('Author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.argument.author',
                'property' => 'username',
            ])
            ->add('body', null, [
                'label' => 'admin.fields.argument.body',
                'attr' => [
                    'rows' => 10,
                ],
            ])
            ->add('expired', null, [
                'label' => 'admin.global.expired',
                'read_only' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                'attr' => [
                  'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                ],
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.argument.is_trashed',
                'required' => false,
            ])
            ->add('trashedReason', null, [
                'label' => 'admin.fields.argument.trashed_reason',
                'required' => false,
            ])
        ;
    }

    /**
     * @param ShowMapper $showMapper
     */
    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();

        $showMapper
            ->add('body', null, [
                'label' => 'admin.fields.argument.body',
            ])
            ->add('type', null, [
                'label' => 'admin.fields.argument.type',
                'template' => 'CapcoAdminBundle:Argument:type_show_field.html.twig',
                'typesLabels' => Argument::$argumentTypesLabels,
            ])
            ->add('opinion', null, [
                'label' => 'admin.fields.argument.opinion',
            ])
            ->add('Author', null, [
                'label' => 'admin.fields.argument.author',
            ])
            ->add('votesCount', null, [
                'label' => 'admin.fields.argument.vote_count',
            ])
            ->add('createdAt', null, [
                'label' => 'admin.fields.argument.created_at',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.argument.updated_at',
            ])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.argument.is_enabled',
            ])
            ->add('isTrashed', null, [
                'label' => 'admin.fields.argument.is_trashed',
            ])
        ;

        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, [
                    'label' => 'admin.fields.argument.trashed_at',
                ])
                ->add('trashedReason', null, [
                    'label' => 'admin.fields.argument.trashed_reason',
                ])
            ;
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}

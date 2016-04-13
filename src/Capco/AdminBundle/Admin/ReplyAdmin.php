<?php

namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;

class ReplyAdmin extends Admin
{
    /**
     * @param DatagridMapper $datagridMapper
     */
    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('author', 'doctrine_orm_model_autocomplete', [
                'label' => 'admin.fields.reply.author',
            ], null, [
                'property' => 'username',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.reply.updated_at',
            ])
            ->add('questionnaire.step', null, [
                'label' => 'admin.fields.reply.questionnaire_step',
            ])
            ->add('questionnaire.step.projectAbstractStep.project', null, [
                'label' => 'admin.fields.reply.project',
            ])
        ;
    }

    /**
     * @param ListMapper $listMapper
     */
    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('id', null, [
                'label' => 'admin.fields.reply.id',
            ])
            ->add('author', 'sonata_type_model', [
                'label' => 'admin.fields.reply.author',
            ])
            ->add('enabled', null, [
                'label' => 'admin.fields.reply.enabled',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.reply.updated_at',
            ])
            ->add('_action', 'actions', [
                'actions' => [
                    'show' => [
                        'template' => 'CapcoAdminBundle:Reply:list__action_show.html.twig',
                    ],
                    'edit' => [
                        'template' => 'CapcoAdminBundle:CRUD:list__action_edit.html.twig',
                    ],
                ],
            ])
        ;
    }

    /**
     * @param FormMapper $formMapper
     */
    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.reply.group_content')
                ->add('author', 'sonata_type_model_autocomplete', [
                    'label' => 'admin.fields.reply.author',
                    'required' => true,
                    'property' => 'username',
                ])
                ->add('questionnaire', null, [
                    'label' => 'admin.fields.reply.questionnaire',
                ])
            ->end()
            ->with('admin.fields.reply.group_publication')
                ->add('enabled', null, [
                    'label' => 'admin.fields.reply.enabled',
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
        $showMapper
            ->add('author', 'sonata_type_model', [
                'label' => 'admin.fields.reply.author',
            ])
            ->add('updatedAt', null, [
                'label' => 'admin.fields.reply.updated_at',
            ])
            ->add('responses', null, [
                'label' => 'admin.fields.reply.responses',
                'template' => 'CapcoAdminBundle:Reply:responses_show_field.html.twig',
            ])
        ;
    }
}

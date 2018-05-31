<?php

namespace Capco\AdminBundle\Admin;

use Doctrine\Common\Collections\ArrayCollection;
use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

class ReplyAdmin extends Admin
{
    public function preUpdate($object)
    {
        $responses = new ArrayCollection();
        foreach ($object->getResponses() as $response) {
            $decodedValue = json_decode($response->getValue());
            if (JSON_ERROR_NONE === json_last_error()) {
                $response->setValue($decodedValue);
            }
            $responses->add($response);
        }
        $object->setResponses($responses);
    }

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
        $currentUser = $this->getConfigurationPool()->getContainer()->get('security.token_storage')->getToken()->getUser();
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
                ->add('private', null, [
                    'label' => 'admin.fields.reply.private',
                    'required' => false,
                ])
                ->add('expired', null, [
                    'label' => 'admin.global.expired',
                    'read_only' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                    'attr' => [
                      'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                    ],
                ])
            ->end()
            ->with('admin.fields.reply.group_responses')
                ->add('responses', 'sonata_type_collection', [
                    'label' => 'admin.fields.reply.responses',
                    'required' => false,
                    'btn_add' => false,
                    'by_reference' => false,
                ], [
                    'edit' => 'inline',
                    'inline' => 'table',
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

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->remove('create');
    }
}

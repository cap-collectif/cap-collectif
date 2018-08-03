<?php
namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Capco\AppBundle\Entity\Argument;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Capco\AppBundle\Form\Type\TrashedStatusType;

class ArgumentAdmin extends Admin
{
    protected $datagridValues = ['_sort_order' => 'DESC', '_sort_by' => 'updatedAt'];

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('type', null, ['label' => 'admin.fields.argument.type'])
            ->add('opinion', null, ['label' => 'admin.fields.argument.opinion'])
            ->add(
                'Author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.argument.author'],
                null,
                ['property' => 'username']
            )
            ->add('votesCount', null, ['label' => 'admin.fields.argument.vote_count'])
            ->add('updatedAt', null, ['label' => 'admin.fields.argument.updated_at'])
            ->add('isEnabled', null, ['label' => 'admin.fields.argument.is_enabled'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.argument.is_trashed'])
            ->add('expired', null, ['label' => 'admin.global.expired']);
    }

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
            ->add('opinion', 'sonata_type_model', ['label' => 'admin.fields.argument.opinion'])
            ->add('Author', 'sonata_type_model', ['label' => 'admin.fields.argument.author'])
            ->add('votesCount', null, ['label' => 'admin.fields.argument.vote_count'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.argument.is_enabled',
            ])
            ->add('trashedStatus', null, [
                'label' => 'admin.fields.opinion.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', 'datetime', ['label' => 'admin.fields.argument.updated_at'])
            ->add('_action', 'actions', ['actions' => ['delete' => []]]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $currentUser = $this->getConfigurationPool()
            ->getContainer()
            ->get('security.token_storage')
            ->getToken()
            ->getUser();
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
            ->add('body', null, ['label' => 'admin.fields.argument.body', 'attr' => ['rows' => 10]])
            ->add('expired', null, [
                'label' => 'admin.global.expired',
                'attr' => [
                    'disabled' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                    'readonly' => !$currentUser->hasRole('ROLE_SUPER_ADMIN'),
                ],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'admin.fields.opinion.is_trashed',
            ])
            ->add('trashedReason', null, [
                'label' => 'admin.fields.argument.trashed_reason',
                'required' => false,
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}

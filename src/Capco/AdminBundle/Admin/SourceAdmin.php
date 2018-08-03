<?php
namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Show\ShowMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Capco\AppBundle\Form\Type\TrashedStatusType;

class SourceAdmin extends Admin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, ['label' => 'admin.fields.source.title'])
            ->add('body', null, ['label' => 'admin.fields.source.body'])
            ->add(
                'author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.source.author'],
                null,
                ['property' => 'username']
            )
            ->add('opinion', null, ['label' => 'admin.fields.source.opinion'])
            ->add('category', null, ['label' => 'admin.fields.source.category'])
            ->add('link', null, ['label' => 'admin.fields.source.link'])
            ->add('votesCount', null, ['label' => 'admin.fields.source.vote_count_source'])
            ->add('updatedAt', null, ['label' => 'admin.fields.source.updated_at'])
            ->add('createdAt', null, ['label' => 'admin.fields.source.created_at'])
            ->add('isEnabled', null, ['label' => 'admin.fields.source.is_enabled'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.source.is_trashed'])
            ->add('expired', null, ['label' => 'admin.global.expired']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'admin.fields.source.title'])
            ->add('author', 'sonata_type_model', ['label' => 'admin.fields.source.author'])
            ->add('opinion', 'sonata_type_model', ['label' => 'admin.fields.source.opinion'])
            ->add('category', 'sonata_type_model', ['label' => 'admin.fields.source.category'])
            ->add('votesCount', null, ['label' => 'admin.fields.source.vote_count_source'])
            ->add('isEnabled', null, [
                'editable' => true,
                'label' => 'admin.fields.source.is_enabled',
            ])
            ->add('trashedStatus', null, [
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
                'label' => 'admin.fields.source.is_trashed',
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.source.updated_at'])
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
            ->add('title', null, ['label' => 'admin.fields.source.title'])
            ->add('isEnabled', null, [
                'label' => 'admin.fields.source.is_enabled',
                'required' => false,
            ])
            ->add('body', null, ['label' => 'admin.fields.source.body'])
            ->add('author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.source.author',
                'property' => 'username',
            ])
            ->add('opinion', 'sonata_type_model', ['label' => 'admin.fields.source.opinion'])
            ->add('category', 'sonata_type_model', ['label' => 'admin.fields.source.category'])
            ->add('link', null, [
                'label' => 'admin.fields.source.link',
                'attr' => ['placeholder' => 'http://www.cap-collectif.com/'],
            ])
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
                'label' => 'admin.fields.source.trashed_reason',
                'required' => false,
            ]);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}

<?php
namespace Capco\AdminBundle\Admin;

use Sonata\AdminBundle\Admin\Admin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Sonata\AdminBundle\Show\ShowMapper;

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
                'editable' => true,
                'label' => 'admin.fields.source.is_trashed',
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.source.updated_at'])
            ->add('_action', 'actions', [
                'actions' => ['show' => [], 'edit' => [], 'delete' => []],
            ]);
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
            ->add('trashedStatus', null, [
                'label' => 'admin.fields.source.is_trashed',
                'required' => false,
            ])
            ->add('trashedReason', null, [
                'label' => 'admin.fields.source.trashed_reason',
                'required' => false,
            ]);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
        $subject = $this->getSubject();
        $showMapper
            ->add('title', null, ['label' => 'admin.fields.source.title'])
            ->add('body', null, ['label' => 'admin.fields.source.body'])
            ->add('author', null, ['label' => 'admin.fields.source.author'])
            ->add('opinion', null, ['label' => 'admin.fields.source.opinion'])
            ->add('category', null, ['label' => 'admin.fields.source.category'])
            ->add('link', null, ['label' => 'admin.fields.source.link'])
            ->add('votesCount', null, ['label' => 'admin.fields.source.vote_count_source'])
            ->add('isEnabled', null, ['label' => 'admin.fields.source.is_enabled'])
            ->add('createdAt', null, ['label' => 'admin.fields.source.created_at'])
            ->add('updatedAt', null, ['label' => 'admin.fields.source.updated_at'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.source.is_trashed']);
        if ($subject->getIsTrashed()) {
            $showMapper
                ->add('trashedAt', null, ['label' => 'admin.fields.source.trashed_at'])
                ->add('trashedReason', null, ['label' => 'admin.fields.source.trashed_reason']);
        }
    }

    protected function configureRoutes(RouteCollection $collection)
    {
    }
}

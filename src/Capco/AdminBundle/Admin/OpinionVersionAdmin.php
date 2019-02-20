<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\ProjectVisibilityMode;
use Doctrine\DBAL\Query\QueryBuilder;
use Ivory\CKEditorBundle\Form\Type\CKEditorType;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Capco\AppBundle\Form\Type\TrashedStatusType;
use Sonata\AdminBundle\Show\ShowMapper;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class OpinionVersionAdmin extends AbstractAdmin
{
    protected $datagridValues = ['_sort_order' => 'ASC', '_sort_by' => 'title'];
    private $tokenStorage;

    public function __construct(
        string $code,
        string $class,
        string $baseControllerName,
        TokenStorageInterface $tokenStorage
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->tokenStorage = $tokenStorage;
    }

    public function getBatchActions()
    {
    }

    /**
     * if user is supper admin return all else return only what I can see.
     */
    public function createQuery($context = 'list')
    {
        $user = $this->tokenStorage->getToken()->getUser();
        if ($user->hasRole('ROLE_SUPER_ADMIN')) {
            return parent::createQuery($context);
        }

        /** @var QueryBuilder $query */
        $query = parent::createQuery($context);
        $query
            ->leftJoin($query->getRootAliases()[0] . '.parent', 'pa')
            ->leftJoin('pa.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'p')
            ->orWhere(
                $query
                    ->expr()
                    ->andX(
                        $query->expr()->eq('p.Author', ':author'),
                        $query->expr()->eq('p.visibility', ProjectVisibilityMode::VISIBILITY_ME)
                    )
            );
        $query->orWhere(
            $query->expr()->gte('p.visibility', ProjectVisibilityMode::VISIBILITY_ADMIN)
        );
        $query->setParameter('author', $user);

        return $query;
    }

    protected function configureDatagridFilters(DatagridMapper $datagridMapper)
    {
        $datagridMapper
            ->add('title', null, ['label' => 'admin.fields.opinion_version.title'])
            ->add('body', null, ['label' => 'admin.fields.opinion_version.body'])
            ->add('comment', null, ['label' => 'admin.fields.opinion_version.comment'])
            ->add(
                'author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'admin.fields.opinion_version.author'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    },
                ]
            )
            ->add('parent', null, ['label' => 'admin.fields.opinion_version.parent'])
            ->add('published', null, ['label' => 'admin.fields.opinion_version.is_enabled'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.opinion_version.is_trashed'])
            ->add('updatedAt', null, ['label' => 'admin.fields.opinion_version.updated_at']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'admin.fields.opinion_version.title'])
            ->add('body', null, ['label' => 'admin.fields.opinion_version.body'])
            ->add('comment', null, ['label' => 'admin.fields.opinion_version.comment'])
            ->add('author', null, ['label' => 'admin.fields.opinion_version.author'])
            ->add('parent', null, ['label' => 'admin.fields.opinion_version.parent'])
            ->add('published', null, [
                'label' => 'admin.fields.opinion_version.is_enabled',
                'editable' => false,
            ])
            ->add('trashedStatus', null, [
                'label' => 'admin.fields.opinion_version.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', null, ['label' => 'admin.fields.opinion_version.updated_at'])
            ->add('_action', 'actions', ['actions' => ['delete' => []]]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('admin.fields.opinion_version.group_content', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_version.group_publication', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_version.group_answer', ['class' => 'col-md-12'])
            ->end()
            ->end();
        $formMapper
            ->with('admin.fields.opinion_version.group_content')
            ->add('title', null, ['label' => 'admin.fields.opinion_version.title'])
            ->add('author', 'sonata_type_model_autocomplete', [
                'label' => 'admin.fields.opinion_version.author',
                'property' => 'username',
            ])
            ->add('parent', 'sonata_type_model', ['label' => 'admin.fields.opinion_version.parent'])
            ->add('body', CKEditorType::class, [
                'label' => 'admin.fields.opinion_version.body',
                'config_name' => 'admin_editor',
            ])
            ->add('comment', CKEditorType::class, [
                'label' => 'admin.fields.opinion_version.comment',
                'config_name' => 'admin_editor',
            ])
            ->end()

            ->with('admin.fields.opinion_version.group_publication')
            ->add('published', null, [
                'label' => 'admin.fields.opinion_version.is_enabled',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'admin.fields.opinion.is_trashed',
            ])
            ->add('trashedReason', null, ['label' => 'admin.fields.opinion_version.trashed_reason'])
            ->end()

            ->with('admin.fields.opinion_version.group_answer')
            ->add('answer', 'sonata_type_model_list', [
                'label' => 'admin.fields.opinion_version.answer',
                'btn_list' => false,
                'required' => false,
            ])
            ->end();
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list', 'create', 'edit', 'delete', 'show']);
    }

    protected function configureShowFields(ShowMapper $showMapper)
    {
    }
}

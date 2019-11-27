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
            ->innerJoin('pa.consultation', 'pac')
            ->innerJoin('pac.step', 's')
            ->leftJoin('s.projectAbstractStep', 'pAs')
            ->leftJoin('pAs.project', 'p')
            ->leftJoin('p.authors', 'authors')
            ->orWhere(
                $query
                    ->expr()
                    ->andX(
                        $query->expr()->eq('authors.user', ':author'),
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
            ->add('title', null, ['label' => 'global.title'])
            ->add('body', null, ['label' => 'global.contenu'])
            ->add('comment', null, ['label' => 'global.explanation'])
            ->add(
                'author',
                'doctrine_orm_model_autocomplete',
                ['label' => 'global.author'],
                null,
                [
                    'property' => 'email,username',
                    'to_string_callback' => function ($enitity, $property) {
                        return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                    },
                ]
            )
            ->add('parent', null, ['label' => 'admin.fields.opinion_version.parent'])
            ->add('published', null, ['label' => 'global.published'])
            ->add('trashedStatus', null, ['label' => 'global.is_trashed'])
            ->add('updatedAt', null, ['label' => 'global.maj']);
    }

    protected function configureListFields(ListMapper $listMapper)
    {
        unset($this->listModes['mosaic']);

        $listMapper
            ->addIdentifier('title', null, ['label' => 'global.title'])
            ->add('body', null, ['label' => 'global.contenu'])
            ->add('comment', null, ['label' => 'global.explanation'])
            ->add('author', null, ['label' => 'global.author'])
            ->add('parent', null, ['label' => 'admin.fields.opinion_version.parent'])
            ->add('published', null, [
                'label' => 'global.published',
                'editable' => false,
            ])
            ->add('trashedStatus', null, [
                'label' => 'global.is_trashed',
                'template' => 'CapcoAdminBundle:Trashable:trashable_status.html.twig',
            ])
            ->add('updatedAt', null, ['label' => 'global.maj'])
            ->add('_action', 'actions', ['actions' => ['delete' => []]]);
    }

    protected function configureFormFields(FormMapper $formMapper)
    {
        $formMapper
            ->with('global.contenu', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_version.group_publication', ['class' => 'col-md-12'])
            ->end()
            ->with('admin.fields.opinion_version.group_answer', ['class' => 'col-md-12'])
            ->end()
            ->end();
        $formMapper
            ->with('global.contenu')
            ->add('title', null, ['label' => 'global.title'])
            ->add('author', 'sonata_type_model_autocomplete', [
                'label' => 'global.author',
                'property' => 'username,email',
                'to_string_callback' => function ($enitity, $property) {
                    return $enitity->getEmail() . ' - ' . $enitity->getUsername();
                },
            ])
            ->add('parent', 'sonata_type_model', ['label' => 'admin.fields.opinion_version.parent'])
            ->add('body', CKEditorType::class, [
                'label' => 'global.contenu',
                'config_name' => 'admin_editor',
            ])
            ->add('comment', CKEditorType::class, [
                'label' => 'global.explanation',
                'config_name' => 'admin_editor',
            ])
            ->end()

            ->with('admin.fields.opinion_version.group_publication')
            ->add('published', null, [
                'label' => 'global.published',
                'disabled' => true,
                'attr' => ['readonly' => true],
            ])
            ->add('trashedStatus', TrashedStatusType::class, [
                'label' => 'global.is_trashed',
            ])
            ->add('trashedReason', null, ['label' => 'global.trashed_reason'])
            ->end()

            ->with('admin.fields.opinion_version.group_answer')
            ->add('answer', 'sonata_type_model_list', [
                'label' => 'official.answer',
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

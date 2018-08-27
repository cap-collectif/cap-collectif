<?php
namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Form\Type\TrashedStatusType;
use Doctrine\DBAL\Query\QueryBuilder;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Datagrid\DatagridMapper;
use Sonata\AdminBundle\Datagrid\ListMapper;
use Sonata\AdminBundle\Form\FormMapper;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Capco\AppBundle\Enum\ProjectVisibilityMode;

class SourceAdmin extends AbstractAdmin
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
            ->add('published', null, ['label' => 'admin.fields.source.is_enabled'])
            ->add('trashedStatus', null, ['label' => 'admin.fields.source.is_trashed']);
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
            ->add('published', null, [
                'editable' => false,
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
            ->add('published', null, [
                'label' => 'admin.fields.source.is_enabled',
                'disabled' => true,
                'attr' => ['readonly' => true],
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

    /**
     * if user is supper admin return all else return only what I can see
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
            ->leftJoin($query->getRootAliases()[0] . '.opinion', 'op')
            ->leftJoin('op.step', 's')
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
}

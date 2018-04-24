<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaComment;
use Capco\AppBundle\Entity\IdeaVote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\Questions\AbstractQuestion;
use Capco\AppBundle\Entity\Questions\QuestionnaireAbstractQuestion;
use Capco\AppBundle\Entity\Questions\SimpleQuestion;
use Capco\AppBundle\Entity\Responses\ValueResponse;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ProjectAbstractStep;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\EntityManager;
use SAML2\Utilities\ArrayCollection;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180417144708 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');

        /* ------********************************************************------ */
        /* ------* create anonymous users from ideas for proposal votes *------ */
        /* ------********************************************************------ */
        $this->write('-> create anonymous users from ideas for proposal votes');

        $usersToCreate = $em->getRepository(IdeaVote::class)->findBy(['user' => null]);
        $this->createUserFromAnonymous($em, $usersToCreate);

        /* --------------------*************************-------------------- */
        /* --------------------* create project & step *-------------------- */
        /* --------------------*************************-------------------- */
        $this->write('-> create project boite à idées');

        $collectStep = (new CollectStep())
            ->setTitle('Dépôt')
            ->setLabel('Dépôt')
            ->setStartAt(new \DateTime('now'))
            ->setEndAt(new \DateTime('+ 30 days'))
            ->setVoteType(VoteTypeTrait::$VOTE_TYPE_SIMPLE);
        $project = (new Project())
            ->setTitle('Boîte à idées')
            ->setIsEnabled(true)
            ->setAuthor($em->getRepository(User::class)->findOneBy(['email' => 'admin@cap-collectif.com']))
            ->setCreatedAt(new \DateTime('now'))
            ->setPublishedAt(new \DateTime('now'))
            ->setUpdatedAt(new \DateTime('now'));
        $project->addStep(
            (new ProjectAbstractStep())
                ->setProject($project)
                ->setStep($collectStep)
                ->setPosition(1)
        );
        $em->persist($project);

        /* --------------------*************************--------------------- */
        /* --------------------*  create proposalForm  *--------------------- */
        /* --------------------*************************--------------------- */
        $this->write('-> create proposalForm');

        $question = (new SimpleQuestion())
            ->setTitle('Objectif')
            ->setType(AbstractQuestion::QUESTION_TYPE_MULTILINE_TEXT);
        $questionnaireQuestion = (new QuestionnaireAbstractQuestion())
            ->setPosition(0)
            ->setQuestion($question);
        $proposalForm = (new ProposalForm())
            ->setTitle('Boîte à idées')
            ->setDescription('Partagez vos idées !')
            ->addQuestion($questionnaireQuestion)
            ->setStep($project->getSteps()[0]->getStep());
        $em->persist($proposalForm);

        /* -----------------********************************------------------- */
        /* -----------------* import ideas into proposals  *------------------- */
        /* -----------------********************************------------------- */
        $this->write('-> import ideas into proposals');
        $this->importIdeas($em,$proposalForm);

    }

    public function importIdeas(EntityManager $em, ProposalForm $proposalForm ) {
        
        $output = new ConsoleOutput();
        $ideas = $em->getRepository(Idea::class)->findAll();
        $progress = new ProgressBar($output, \count($ideas));
        $questions = $proposalForm->getRealQuestions()->first();

        foreach($ideas as $idea) {
            $response = (new ValueResponse())
                ->setValue($idea->getObject())
                ->setQuestion($questions);

            $proposal = (new Proposal())
                ->setProposalForm($proposalForm)
                ->setTitle($idea->getTitle())
                ->setAuthor($idea->getAuthor())
                ->setEnabled($idea->getIsEnabled())
                ->setIsTrashed($idea->getIsTrashed())
                ->setBody($idea->getBody())
                ->setTheme($idea->getTheme())
                ->setCreatedAt($idea->getCreatedAt())
                ->addResponse($response)
                ->setUpdatedAt($idea->getUpdatedAt());


            if($idea->getMedia()){
                $proposal->setMedia($idea->getMedia());
            }

            /* -----------------**************************************************---------------- */
            /* -----------------* import ideas votes & create user if no account *---------------- */
            /* -----------------**************************************************---------------- */


            foreach ($idea->getVotes() as $ideaVote) {
                $vote = (new ProposalCollectVote())
                    ->setProposal($proposal)
                    ->setCollectStep($proposal->getStep())
                    ->setCreatedAt($ideaVote->getCreatedAt())
                    ->setUser($ideaVote->getUser())
                    ->setUsername($ideaVote->getUsername())
                    ->setEmail($ideaVote->getEmail())
                    ->setIpAddress($ideaVote->getIpAddress())
                ;

                    $proposal->addCollectVote($vote);
            }

            /* -----------------***************************************------------------- */
            /* -----------------* import ideas comments into proposal *------------------- */
            /* -----------------***************************************------------------- */
            foreach ($idea->getComments() as $ideaComment) {
                $proposalComment = (new ProposalComment())
                    ->setAuthor($ideaComment->getAuthor())
                    ->setAuthorName($ideaComment->getAuthorName())
                    ->setAuthorEmail($ideaComment->getAuthorEmail())
                    ->setAuthorIp($ideaComment->getAuthorIp())
                    ->setProposal($proposal)
                    ->setIsEnabled($ideaComment->getIsEnabled())
                    ->setIsTrashed($ideaComment->getIsTrashed())
                    ->setPinned($ideaComment->isPinned())
                    ->setValidated($ideaComment->isValidated())
                    ->setCreatedAt($ideaComment->getCreatedAt())
                    ->setUpdatedAt($ideaComment->getUpdatedAt())
                    ->setBody($ideaComment->getBody());


                if($ideaComment->getAnswers()) {
                    foreach ($ideaComment->getAnswers() as $ideaAnswer) {
                        $answer = (new ProposalComment())
                            ->setAuthor($ideaAnswer->getAuthor())
                            ->setAuthorName($ideaAnswer->getAuthorName())
                            ->setAuthorEmail($ideaAnswer->getAuthorEmail())
                            ->setAuthorIp($ideaAnswer->getAuthorIp())
                            ->setProposal($proposal)
                            ->setIsEnabled($ideaAnswer->getIsEnabled())
                            ->setIsTrashed($ideaAnswer->getIsTrashed())
                            ->setPinned($ideaAnswer->isPinned())
                            ->setValidated($ideaAnswer->isValidated())
                            ->setCreatedAt($ideaAnswer->getCreatedAt())
                            ->setUpdatedAt($ideaAnswer->getUpdatedAt())
                            ->setParent($proposalComment)
                            ->setBody($ideaAnswer->getBody());

                        $proposalComment->addAnswer($answer);
                    }

                }
                /* -----------------********************************-------------------- */
                /* -----------------*     import comments votes    *-------------------- */
                /* -----------------********************************-------------------- */
                foreach ($ideaComment->getVotes() as $ideaCommentVote) {
                    $commentVote = (new CommentVote())
                        ->setComment($proposalComment)
                        ->setCreatedAt($ideaCommentVote->getCreatedAt())
                        ->setUser($ideaCommentVote->getUser())
                    ;

                    $proposalComment->addVote($commentVote);
                    //$em->remove($ideaCommentVote);
                }

                //$em->remove($ideaComment);
                $proposal->addComment($proposalComment);
            }

            $em->persist($proposal);
            //$em->remove($idea);

            $progress->advance();
        }
        $em->flush();
    }

    public function createUserFromAnonymous(EntityManager $em, array $usersToCreate) {

        $output = new ConsoleOutput();
        $progress = new ProgressBar($output, \count($usersToCreate));
        $users = [];

        foreach($usersToCreate as $anonymous) {
            $email = trim(strtolower($anonymous->getEmail()));
            $emailAlreadyUsed = $em->getRepository(User::class)->findOneBy([
                'email' => $email
            ]);

            if(!$emailAlreadyUsed && !$anonymous->getUser() && $email && !isset($users[$email])) {
                $users[$email] = (new User())
                    ->setEmail($email)
                    ->setPassword('')
                ;
               
                array_unique($users);
                $anonymous->setUser($users[$email]);
                
                $em->persist($users[$email]);
                $em->persist($anonymous);
            }
            $progress->advance();
        }
   
        $this->write('  -> ' . \count($users) . ' users created');
        $em->flush();
    }

    public function postDown(Schema $schema)
    {
    }

    /**
     * @param Schema $schema
     */
    public function up(Schema $schema)
    {
        // this up() migration is auto-generated, please modify it to your needs

    }

    /**
     * @param Schema $schema
     */
    public function down(Schema $schema)
    {
        // this down() migration is auto-generated, please modify it to your needs

    }
}

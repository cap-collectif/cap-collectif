<?php

namespace Application\Migrations;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\CommentVote;
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
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Traits\VoteTypeTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\ORM\EntityManager;
use Symfony\Component\Console\Helper\ProgressBar;
use Symfony\Component\Console\Output\ConsoleOutput;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
class Version20180424144708 extends AbstractMigration implements ContainerAwareInterface
{
    private $container;

    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function postUp(Schema $schema)
    {
        $em = $this->container->get('doctrine.orm.entity_manager');
        $ideas = $this->connection->fetchAll("SELECT * FROM idea", ['']);

        if(!empty($ideas)) {

            /* ------********************************************************------ */
            /* ------* create anonymous users from ideas for proposal votes *------ */
            /* ------********************************************************------ */
            $this->write('-> searching votes where user is not set then create if not exist');

            $votesWithoutUser = $this->connection->fetchAll(
                "SELECT * FROM votes WHERE voteType = 'idea' AND voter_id IS NULL",
                ['']
            );
            $this->createUserFromAnonymous($em, $votesWithoutUser);

            /* --------------------*************************-------------------- */
            /* --------------------* create project & step *-------------------- */
            /* --------------------*************************-------------------- */
            $this->write('-> create project boite à idées');

            $collectStep = (new CollectStep())
                ->setTitle('Dépôt')
                ->setLabel('Dépôt')
                ->setTimeless(true)
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
            $this->importIdeas($em, $proposalForm);

        } else {
            $this->write('-> Skipping migration, no ideas to import...');
        }


    }

    public function importIdeas(EntityManager $em, ProposalForm $proposalForm)
    {

        $output = new ConsoleOutput();
        $ideas = $this->connection->fetchAll("SELECT * FROM idea", ['']);
        $progress = new ProgressBar($output, \count($ideas));
        $questions = $proposalForm->getRealQuestions()->first();

        foreach ($ideas as $idea) {
            $response = (new ValueResponse())
                ->setValue($idea['object'])
                ->setQuestion($questions);

            $proposal = (new Proposal())
                ->setProposalForm($proposalForm)
                ->setTitle($idea['title'])
                ->setAuthor($em->getRepository(User::class)->findOneBy(['id' => $idea['author_id']]))
                ->setEnabled($idea['is_enabled'])
                ->setIsTrashed($idea['is_trashed'])
                ->setBody($idea['body'])
                ->setTheme($em->getRepository(Theme::class)->findOneBy(['id' => $idea['theme_id']]))
                ->setCreatedAt(new \DateTime($idea['created_at']))
                ->addResponse($response)
                ->setUpdatedAt(new \DateTime($idea['updated_at']));


            if ($idea['media_id']) {
                $proposal->setMedia($em->getRepository(Theme::class)->findOneBy(['id' => $idea['media_id']]));
            }

            /* -----------------**************************************************---------------- */
            /* -----------------* import ideas votes & create user if no account *---------------- */
            /* -----------------**************************************************---------------- */

            $ideaVotes = $this->connection->fetchAll("SELECT * FROM votes WHERE idea_id = :id", ['id' => $idea['id']]);
            foreach ($ideaVotes as $ideaVote) {
                $vote = (new ProposalCollectVote())
                    ->setProposal($proposal)
                    ->setCollectStep($proposal->getStep())
                    ->setCreatedAt(new \DateTime($ideaVote['created_at']))
                    ->setUser($em->getRepository(User::class)->findOneBy(['id' => $ideaVote['voter_id']]))
                    ->setUsername($ideaVote['username'])
                    ->setEmail($ideaVote['email'])
                    ->setIpAddress($ideaVote['ip_address']);

                $proposal->addCollectVote($vote);
            }

            /* -----------------***************************************------------------- */
            /* -----------------* import ideas comments into proposal *------------------- */
            /* -----------------***************************************------------------- */
            $ideaComments = $this->connection->fetchAll(
                "SELECT * FROM comment WHERE objectType = 'idea' AND idea_id = :id AND parent_id IS NULL",
                ['id' => $idea['id']]
            );
            foreach ($ideaComments as $ideaComment) {
                $proposalComment = (new ProposalComment())
                    ->setAuthor($em->getRepository(User::class)->findOneBy(['id' => $ideaComment['author_id']]))
                    ->setAuthorName($ideaComment['author_name'])
                    ->setAuthorEmail($ideaComment['author_email'])
                    ->setAuthorIp($ideaComment['author_ip'])
                    ->setProposal($proposal)
                    ->setIsEnabled($ideaComment['is_enabled'])
                    ->setIsTrashed($ideaComment['is_trashed'])
                    ->setPinned($ideaComment['pinned'])
                    ->setValidated($ideaComment['validated'])
                    ->setCreatedAt(new \DateTime($ideaComment['created_at']))
                    ->setUpdatedAt(new \DateTime($ideaComment['updated_at']))
                    ->setBody($ideaComment['body']);

                $ideaCommentAnswers = $this->connection->fetchAll(
                    "SELECT * FROM comment WHERE parent_id = :id",
                    ['id' => $ideaComment['id']]
                );
                if (!empty($ideaCommentAnswers)) {
                    foreach ($ideaCommentAnswers as $ideaAnswer) {
                        $answer = (new ProposalComment())
                            ->setAuthor(
                                $em->getRepository(User::class)->findOneBy(['id' => $ideaAnswer['author_id']])
                            )
                            ->setAuthorName($ideaAnswer['author_name'])
                            ->setAuthorEmail($ideaAnswer['author_email'])
                            ->setAuthorIp($ideaAnswer['author_ip'])
                            ->setProposal($proposal)
                            ->setIsEnabled($ideaAnswer['is_enabled'])
                            ->setIsTrashed($ideaAnswer['is_trashed'])
                            ->setPinned($ideaAnswer['pinned'])
                            ->setValidated($ideaAnswer['validated'])
                            ->setCreatedAt(new \DateTime($ideaComment['created_at']))
                            ->setUpdatedAt(new \DateTime($ideaComment['updated_at']))
                            ->setParent($proposalComment)
                            ->setBody($ideaComment['body']);

                        $proposalComment->addAnswer($answer);
                    }
                }

                /* -----------------********************************-------------------- */
                /* -----------------*     import comments votes    *-------------------- */
                /* -----------------********************************-------------------- */
                $ideaCommentsVotes = $this->connection->fetchAll(
                    "SELECT * FROM votes WHERE voteType = 'comment' AND comment_id = :id",
                    ['id' => $proposalComment->getId()]
                );
                foreach ($ideaCommentsVotes as $ideaCommentVote) {
                    $commentVote = (new CommentVote())
                        ->setComment($proposalComment)
                        ->setCreatedAt(new \DateTime($ideaCommentVote['updated_at']))
                        ->setUser(
                            $em->getRepository(User::class)->findOneBy(['id' => $ideaCommentVote['voter_id']])
                        );

                    $proposalComment->addVote($commentVote);
                }

                $proposal->addComment($proposalComment);
            }

            $em->persist($proposal);
            $progress->advance();
        }

        $em->flush();
    }

    public function createUserFromAnonymous(EntityManager $em, array $votesWithoutUser)
    {

        $output = new ConsoleOutput();
        $progress = new ProgressBar($output, \count($votesWithoutUser));
        $users = [];
        $cheaterCount = 0;

        foreach ($votesWithoutUser as $anonymous) {
            $email = trim(strtolower($anonymous['email']));
            $emailAlreadyUsed = $em->getRepository(User::class)->findOneBy(
                [
                    'email' => $email,
                ]
            );

            if (!$emailAlreadyUsed && !$anonymous['voter_id'] && $email && !isset($users[$email])) {

                $users[$email]['object'] = (new User())
                    ->setEmail($email)
                    ->setPassword('');

                $users[$email]['vote'][] = $anonymous['id'];
                $em->persist($users[$email]['object']);

            } elseif (isset($users[$email])) {
                $users[$email]['vote'][] = $anonymous['id'];

            } elseif ($emailAlreadyUsed) {
                $haveVotedBeforeSignUp = $em->getRepository(AbstractVote::class)->findOneBy(
                    ['user' => $emailAlreadyUsed]
                );

                if (!$haveVotedBeforeSignUp) {
                    $users[$email]['object'] = $emailAlreadyUsed;
                    $users[$email]['vote'][] = $anonymous['id'];
                } else {
                    $cheaterCount++;
                }
            }

            $progress->advance();
        }

        $em->flush();
        $progress->finish();
        $this->write('  -> '.\count($users).' users created');

        $progress = new ProgressBar($output, \count($votesWithoutUser));
        $count = 0;

        foreach ($users as $user) {
            foreach ($user['vote'] as $vote) {
                $this->connection->update('votes', ['voter_id' => $user['object']->getId()], ['id' => $vote]);
                $count++;
                $progress->advance();
            }
        }

        $progress->finish();
        $this->write(
            '  -> '.$count.' votes without user now have one ! '.$cheaterCount.' are double vote (one signed in, one anonymous)'
        );

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

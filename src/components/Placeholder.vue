<template>
  <div class="placeholder-container">
    <h1 class="game-title">Pathfinder's Journey: The Celtic Realm</h1>
    <div class="game-description">
      <p>Welcome to a mystical journey through the Celtic Realm!</p>
      <p>Explore 15 unique landscapes, gather resources, befriend animal companions, and craft items to aid your journey.</p>
    </div>
    
    <div class="game-features">
      <h2>Game Features</h2>
      <ul>
        <li>Choose from 6 unique characters with special abilities</li>
        <li>Explore 15 different landscapes with unique challenges</li>
        <li>Gather 12 different resource types with special effects</li>
        <li>Befriend 10 animal companions with seasonal abilities</li>
        <li>Craft 8 different items with unique abilities</li>
        <li>Experience 5 different seasons affecting gameplay</li>
      </ul>
    </div>
    
    <div class="game-status">
      <h2>Game Status</h2>
      <p>The game is currently under development. We're working on fixing some technical issues to provide you with the best Celtic adventure experience!</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Placeholder'
}
</script>

<style scoped>
.placeholder-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  font-family: 'Cinzel', serif;
  color: #3c2f2f;
}

.game-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  color: #5c3d2e;
}

.game-description {
  margin-bottom: 30px;
  font-size: 1.2rem;
}

.game-features {
  margin-bottom: 30px;
  text-align: left;
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
}

.game-features h2 {
  text-align: center;
  margin-bottom: 15px;
  color: #5c3d2e;
}

.game-features ul {
  list-style-type: none;
  padding: 0;
}

.game-features li {
  padding: 8px 0;
  border-bottom: 1px solid #e0d8c0;
  position: relative;
  padding-left: 25px;
}

.game-features li:before {
  content: "•";
  position: absolute;
  left: 5px;
  color: #5c3d2e;
}

.game-status {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 10px;
}

.game-status h2 {
  color: #5c3d2e;
  margin-bottom: 15px;
}
</style>
